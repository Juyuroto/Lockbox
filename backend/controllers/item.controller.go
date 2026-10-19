package controllers

import (
	"encoding/json"
	"lockbox/config"
	"lockbox/models"
	"lockbox/services"
	"lockbox/utils"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

func CreateItemController(c *gin.Context) {

	var input struct {
		Type 		string 				`json:"type" binding:"required,oneof=password contact"`
		Title    	string 				`json:"title" binding:"required,max=255"`
		FolderID 	*uint 				`json:"folder_id"`
		Data		json.RawMessage		`json:"data" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		utils.SendError(c, 400, "INVALID_JSON", "Invalid JSON data")
		return
	}

	userID := c.MustGet("userID").(uint)

	var vault models.Vault

	if err := config.DB.Where("user_id = ?", userID).First(&vault).Error; err != nil {
		utils.SendError(c, 404, "VAULT_NOT_FOUND", "Vault Not Found")
		return
	}

	var user models.User

	if err := config.DB.First(&user, userID).Error; err != nil{
		utils.SendError(c, 404, "USER_NOT_FOUND", "User not found")
		return
	}

	if input.FolderID != nil {
		var folder models.Folder
		if err := config.DB.Where("id = ? AND user_id = ? AND vault_id = ?", *input.FolderID, userID, vault.ID).First(&folder).Error; err != nil {
			utils.SendError(c, 404, "FOLDER_NOT_FOUND", "Folder not found")
			return
		}
	}

	var plaintext string
	
	switch input.Type {
	case "password":		
		var passwordData models.PasswordData
		if err := json.Unmarshal(input.Data, &passwordData); err != nil {
			utils.SendError(c, 400, "INVALID_PASSWORD_DATA", "Invalid password data")
			return
		}

		if err := binding.Validator.ValidateStruct(passwordData); err != nil {
			utils.SendError(c, 400, "VALIDATION_ERROR", "Login and password are required")
			return
		}

		jsonByte, err := json.Marshal(passwordData);
		if err != nil {
			utils.SendError(c, 500, "SERIALIZATION_ERROR", "Error serializing the item")
			return
		}

		plaintext = string(jsonByte)
		
	case "contact":		
		var contactData models.ContactData
		if err := json.Unmarshal(input.Data, &contactData); err != nil {
			utils.SendError(c, 400, "INVALID_CONTACT_DATA", "Invalid contact data")
			return
		}

		if contactData.FirstName == "" && contactData.LastName == "" {
			utils.SendError(c, 400, "VALIDATION_ERROR", "First name or last name is required")
			return
		}

		if err := binding.Validator.ValidateStruct(contactData); err != nil {
			utils.SendError(c, 400, "VALIDATION_ERROR", "Invalid email")
			return
		}

		jsonByte, err := json.Marshal(contactData);
		if err != nil {
			utils.SendError(c, 500, "SERIALIZATION_ERROR", "Error serializing the item")
			return
		}

		plaintext = string(jsonByte)
		
	default:
		utils.SendError(c, 400, "TYPE_NOT_FOUND", "Type not found")
		return
	}

	ciphertext, err := services.EncryptionAES(plaintext, user.EncryptionKey)
	if err != nil {
    	utils.SendError(c, 500, "ENCRYPTION_ERROR", "Error encrypting the item")
     	return
	}

	item := models.Item{
		Type:     input.Type,
		Title:    input.Title,
		Data:     ciphertext,
		UserID:   userID,
		VaultID:  vault.ID,
		FolderID: input.FolderID,
	}

	if err := config.DB.Create(&item).Error; err != nil {
		utils.SendError(c, 500, "INTERNAL_SERVER_ERROR", "Error creating the item")
		return
	}

	utils.SendSuccess(c, 201, "Item created", gin.H{
		"id":        item.ID,
		"type":      item.Type,
		"title":     item.Title,
		"folder_id": item.FolderID,
		"vault_id":  item.VaultID,
	})
}

func GetItemByIDController(c *gin.Context) {

	userID := c.MustGet("userID").(uint)
	
	id := c.Param("id")
	var item models.Item

	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&item).Error; err != nil {
		utils.SendError(c, 404, "ITEM_NOT_FOUND", "Item Not Found")
		return
	}

	var ciphertext = item.Data

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		utils.SendError(c, 404, "USER_NOT_FOUND", "User not found")
		return
	}

	plaintext, err := services.DecryptionAES(ciphertext, user.EncryptionKey)
	if err != nil {
    	utils.SendError(c, 500, "DECRYPTION_ERROR", "Error decrypting the item")
     	return
	}

	utils.SendSuccess(c, 200, "Item retrieved successfully", json.RawMessage(plaintext))
}

func UpdateItemController(c *gin.Context) {
	var input struct {
		Type 		string 				`json:"type" binding:"required,oneof=password contact"`
		Title    	string 				`json:"title" binding:"required,max=255"`
		FolderID 	*uint 				`json:"folder_id"`
		Data		json.RawMessage		`json:"data" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		utils.SendError(c, 400, "INVALID_JSON", "Invalid JSON data")
		return
	}

	userID := c.MustGet("userID").(uint)

	id := c.Param("id")
	var item models.Item

	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&item).Error; err != nil {
		utils.SendError(c, 404, "ITEM_NOT_FOUND", "Item Not Found")
		return
	}

	if input.FolderID != nil {
		var folder models.Folder
		if err := config.DB.Where("id = ? AND user_id = ? AND vault_id = ?", *input.FolderID, userID, item.VaultID).First(&folder).Error; err != nil {
			utils.SendError(c, 404, "FOLDER_NOT_FOUND", "Folder not found")
			return
		}
	}

	item.Type = input.Type
	item.Title = input.Title
	item.FolderID = input.FolderID

	if len(input.Data) > 0 {
		var user models.User
		if err := config.DB.First(&user, userID).Error; err != nil {
			utils.SendError(c, 404, "USER_NOT_FOUND", "User not found")
			return
		}

		var plaintext string

		switch input.Type {
		case "password":
			var passwordData models.PasswordData
			if err := json.Unmarshal(input.Data, &passwordData); err != nil {
				utils.SendError(c, 400, "INVALID_PASSWORD_DATA", "Invalid password data")
				return
			}

			if err := binding.Validator.ValidateStruct(passwordData); err != nil {
				utils.SendError(c, 400, "VALIDATION_ERROR", "Login and password are required")
				return
			}

			jsonByte, err := json.Marshal(passwordData)
			if err != nil {
				utils.SendError(c, 500, "SERIALIZATION_ERROR", "Error serializing the item")
				return
			}

			plaintext = string(jsonByte)

		case "contact":
			var contactData models.ContactData
			if err := json.Unmarshal(input.Data, &contactData); err != nil {
				utils.SendError(c, 400, "INVALID_CONTACT_DATA", "Invalid contact data")
				return
			}

			if contactData.FirstName == "" && contactData.LastName == "" {
				utils.SendError(c, 400, "VALIDATION_ERROR", "First name or last name is required")
				return
			}

			if err := binding.Validator.ValidateStruct(contactData); err != nil {
				utils.SendError(c, 400, "VALIDATION_ERROR", "Invalid email")
				return
			}

			jsonByte, err := json.Marshal(contactData)
			if err != nil {
				utils.SendError(c, 500, "SERIALIZATION_ERROR", "Error serializing the item")
				return
			}

			plaintext = string(jsonByte)

		default:
			utils.SendError(c, 400, "TYPE_NOT_FOUND", "Type not found")
			return
		}

		ciphertext, err := services.EncryptionAES(plaintext, user.EncryptionKey)
		if err != nil {
			utils.SendError(c, 500, "ENCRYPTION_ERROR", "Error encrypting the item")
			return
		}

		item.Data = ciphertext
	}

	if err := config.DB.Save(&item).Error; err != nil {
		utils.SendError(c, 500, "INTERNAL_SERVER_ERROR", "Error updating the item")
		return
	}

	utils.SendSuccess(c, 200, "Item updated", gin.H{
		"message":   "Item updated",
		"id":        item.ID,
		"type":      item.Type,
		"title":     item.Title,
		"folder_id": item.FolderID,
		"vault_id":  item.VaultID,
	})
}

func DeleteItemController(c *gin.Context) {

	userID := c.MustGet("userID").(uint)
	
	id := c.Param("id")
	var item models.Item

	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&item).Error; err != nil {
		utils.SendError(c, 404, "ITEM_NOT_FOUND", "Item Not Found")
		return
	}

	if err := config.DB.Delete(&item).Error; err != nil {
		utils.SendError(c, 500, "INTERNAL_SERVER_ERROR", "Error deleting the item")
		return
	}

	utils.SendSuccess(c, 200, "Item Deleted Successfully", nil)
}
package controllers

import (
	"encoding/json"
	"lockbox/config"
	"lockbox/models"
	"lockbox/services"

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
		c.JSON(400, gin.H{"error": "Invalid JSON data"})
		return
	}

	userID := c.MustGet("userID").(uint)

	var vault models.Vault

	if err := config.DB.Where("user_id = ?", userID).First(&vault).Error; err != nil {
		c.JSON(404, gin.H{"error": "Vault Not Found",})
		return
	}

	var user models.User

	if err := config.DB.First(&user, userID).Error; err != nil{
		c.JSON(404, gin.H{"error": "User not found"})
		return
	}

	if input.FolderID != nil {
		var folder models.Folder
		if err := config.DB.Where("id = ? AND user_id = ? AND vault_id = ?", *input.FolderID, userID, vault.ID).First(&folder).Error; err != nil {
			c.JSON(404, gin.H{"error": "Folder not found"})
			return
		}
	}

	var plaintext string
	
	switch input.Type {
	case "password":		
		var passwordData models.PasswordData
		if err := json.Unmarshal(input.Data, &passwordData); err != nil {
			c.JSON(400, gin.H{"error": "Invalid password data"})
			return
		}

		if err := binding.Validator.ValidateStruct(passwordData); err != nil {
			c.JSON(400, gin.H{"error": "Login and password are required"})
			return
		}

		jsonByte, err := json.Marshal(passwordData);
		if err != nil {
			c.JSON(500, gin.H{"error": "Error serializing the item"})
			return
		}

		plaintext = string(jsonByte)
		
	case "contact":		
		var contactData models.ContactData
		if err := json.Unmarshal(input.Data, &contactData); err != nil {
			c.JSON(400, gin.H{"error": "Invalid contact data"})
			return
		}

		if contactData.FirstName == "" && contactData.LastName == "" {
			c.JSON(400, gin.H{"error": "First name or last name is required"})
			return
		}

		if err := binding.Validator.ValidateStruct(contactData); err != nil {
			c.JSON(400, gin.H{"error": "Invalid email"})
			return
		}

		jsonByte, err := json.Marshal(contactData);
		if err != nil {
			c.JSON(500, gin.H{"error": "Error serializing the item"})
			return
		}

		plaintext = string(jsonByte)
		
	default:
		c.JSON(400, gin.H{"error": "Type not found"})
		return
	}

	ciphertext, err := services.EncryptionAES(plaintext, user.EncryptionKey)
	if err != nil {
    	c.JSON(500, gin.H{"error": "Error encrypting the item"})
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
		c.JSON(500, gin.H{"error": "Error creating the item"})
		return
	}

	c.JSON(201, gin.H{
		"message":   "Item created",
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
		c.JSON(404, gin.H{"error": "Password Not Found",})
		return
	}

	c.JSON(200, item)
}

func UpdateItemController(c *gin.Context) {
	
}

func DeleteItemController(c *gin.Context) {

	id := c.Param("id")
	var item models.Item

	result := config.DB.First(&item, id)

	if result.Error != nil {
		c.JSON(400, gin.H{"error": "Password Not Found"})
		return
	}

	config.DB.Delete(&item)

	c.JSON(200, gin.H{"error": "Password Deleted Successfully"})
	
}

// 400 StatusBadRequest - 200 StatusOK - 404 StatusNotFound - 500 StatusInternalServerError - 401 StatusUnauthorized - 409 StatusConflict - 201 StatusCreated
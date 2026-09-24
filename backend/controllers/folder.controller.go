package controllers

import (
	"lockbox/config"
	"lockbox/models"

	"github.com/gin-gonic/gin"
)

func GetFolderByIDController(c *gin.Context) {
	
}

func GetFolderNumberItemController(c *gin.Context) {
	
}

func GetFolderItemController(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	id := c.Param("id")
	var folder models.Folder

	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&folder).Error; err != nil {
		c.JSON(404, gin.H{"error": "Folder Not Found",})
		return
	}

	var items []models.Item
	
	if err := config.DB.Where("folder_id = ? AND user_id = ?", id, userID).Find(&items).Error; err != nil {
	    c.JSON(500, gin.H{"error": "Error fetching items"})
	    return
	}

	c.JSON(200, items)
}

func CreateFolderController(c *gin.Context) {

	var input struct {
		Name 		string 		`json:"name" binding:"required"`
		ParentID	*uint		`json:"parent_id"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
   		c.JSON(400, gin.H{"error": "Invalid Request Data",})
		return
    }

    userID := c.MustGet("userID").(uint)

    var vault models.Vault

    if err := config.DB.Where("user_id = ?", userID).First(&vault).Error; err != nil {
    	c.JSON(500, gin.H{"error": "Error fetching id"})
     	return
    }

    if input.ParentID != nil {
  		var folder models.Folder
		if err := config.DB.Where("id = ? AND user_id = ? AND vault_id = ?", *input.ParentID, userID, vault.ID).First(&folder).Error; err != nil {
			c.JSON(404, gin.H{"error": "Folder not found"})
			return
		}
    }
    
}

func DeleteFolderController(c *gin.Context) {
	id := c.Param("id")
	var folder models.Folder

	result := config.DB.First(&folder, id)

	if result.Error != nil {
		c.JSON(404, gin.H{"error": "Folder Not Found"})
		return
	}

	config.DB.Delete(&folder)

	c.JSON(200, gin.H{"message": "Folder Deleted Successfully"})
}

func UpdateFolderController(c *gin.Context) {
	
	id := c.Param("id")
	var folder models.Folder

	result := config.DB.First(&folder, id)
	if result.Error != nil {
		c.JSON(404, gin.H{"error": "Folder Not Found"})
		return
	}

	var input struct {
        Name string `json:"name" binding:"required"`
    }

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": "Invalid Request Data",})
		return
	}

	if err := config.DB.Model(&folder).Updates(input).Error; err != nil {
		c.JSON(400, gin.H{"error": "Failed To Update Folder"})
		return
	}

	c.JSON(200, gin.H{"message": "Folder Updated Successfully"})
	
}

// 400 StatusBadRequest - 200 StatusOK - 404 StatusNotFound - 500 StatusInternalServerError - 401 StatusUnauthorized - 409 StatusConflict - 201 StatusCreated
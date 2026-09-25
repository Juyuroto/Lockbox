package controllers

import (
	"fmt"
	
	"lockbox/config"
	"lockbox/models"

	"github.com/gin-gonic/gin"
)

func GetFolderByIDController(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	id := c.Param("id")

	var folder models.Folder

	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).Preload("Children").First(&folder).Error; err != nil {
		c.JSON(404, gin.H{"error": "Folder Not Found"})
		return
	}

	c.JSON(200, folder)
}

func GetFolderItemController(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	id := c.Param("id")
	var folder models.Folder

	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&folder).Error; err != nil {
		c.JSON(404, gin.H{"error": "Folder Not Found"})
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

    var existingFolder models.Folder
    query := config.DB.Where("user_id = ? AND name = ?", userID, input.Name)
    if input.ParentID == nil {
        query = query.Where("parent_id IS NULL")
    } else {
        query = query.Where("parent_id = ?", *input.ParentID)
    }

    if err := query.First(&existingFolder).Error; err == nil {
        c.JSON(409, gin.H{"error": "This name is already in use."})
        return
    }

    for i := 1; ; i++{
     	candidateName := fmt.Sprintf("%s_%d", input.Name, i)

      	var existingFolder models.Folder

     	if finalName := config.DB.Where("user_id = ? AND name = ? AND parent_id = ?", userID, candidateName, input.ParentID).First(&existingFolder).Error; finalName != nil {
          break
      	}     	
    }

    if input.ParentID != nil {
  		var folder models.Folder
		if err := config.DB.Where("id = ? AND user_id = ? AND vault_id = ?", *input.ParentID, userID, vault.ID).First(&folder).Error; err != nil {
			c.JSON(404, gin.H{"error": "Folder not found"})
			return
		}
    }

    folder := models.Folder {
    	Name:		input.Name,
     	ParentID:	input.ParentID,
      	UserID:		userID,
       	VaultID:	vault.ID,
    }

    if err := config.DB.Create(&folder).Error; err != nil {
    	c.JSON(500, gin.H{"error": "Error Creating the folder"})
     	return
    }

    c.JSON(201, folder)
}

func DeleteFolderController(c *gin.Context) {

	userID := c.MustGet("userID").(uint)

	id := c.Param("id")

	var folder models.Folder

	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).Preload("Children").First(&folder).Error; err != nil {
		c.JSON(404, gin.H{"error": "Folder Not Found"})
		return
	}

	if len(folder.Children) > 0 {
		c.JSON(409, gin.H{"error": "Folder contains subfolders, delete them first"})
		return
	}

	var count int64

	config.DB.Model(&models.Item{}).Where("folder_id = ?", folder.ID).Count(&count)

	if count != 0 {
		c.JSON(409, gin.H{"error": "Folder contains items, delete them first"})
		return
	}

	if err := config.DB.Delete(&folder).Error; err != nil {
		c.JSON(500, gin.H{"error": "Error deleting the folder"})
		return
	}

	c.JSON(200, gin.H{"message": "Folder Deleted Successfully"})
}

func UpdateFolderController(c *gin.Context) {

	userID := c.MustGet("userID").(uint)
	
	id := c.Param("id")
	
	var folder models.Folder

	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&folder).Error; err != nil {
		c.JSON(404, gin.H{"error": "Folder Not Found"})
		return
	}

	var input struct {
        Name 		string 		`json:"name" binding:"required"`
        ParentID	*uint		`json:"parent_id"`
    }

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": "Invalid Request Data",})
		return
	}

	if input.ParentID != nil {
		var parent models.Folder
		if err := config.DB.Where("id = ? AND user_id = ? AND vault_id = ?", *input.ParentID, userID, folder.VaultID).First(&parent).Error; err != nil {
			c.JSON(404, gin.H{"error": "Parent folder not found"})
			return
		}

		visited := map[uint]bool{}
		current := &parent
		for {
			if current.ID == folder.ID {
				c.JSON(409, gin.H{"error": "A folder cannot be moved into itself or one of its subfolders"})
				return
			}
			if current.ParentID == nil || visited[current.ID] {
				break
			}
			visited[current.ID] = true

			var next models.Folder
			if err := config.DB.Where("id = ? AND user_id = ?", *current.ParentID, userID).First(&next).Error; err != nil {
				break
			}
			current = &next
		}
	}

	folder.Name = input.Name
	folder.ParentID = input.ParentID

	if err := config.DB.Save(&folder).Error; err != nil {
		c.JSON(500, gin.H{"error": "Error updating the folder"})
		return
	}

	c.JSON(200, folder)
	
}

// 400 StatusBadRequest - 200 StatusOK - 404 StatusNotFound - 500 StatusInternalServerError - 401 StatusUnauthorized - 409 StatusConflict - 201 StatusCreated
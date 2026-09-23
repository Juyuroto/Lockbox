package controllers

import (
	"lockbox/config"
	"lockbox/models"

	"github.com/gin-gonic/gin"
)

func GetFolderByIDController(c *gin.Context) {
	id := c.Param("id")
	var folder models.Folder

	result := config.DB.First(&folder, id)
	if result.Error != nil {
		c.JSON(404, gin.H{"error": "Folder Not Found",})
		return
	}

	c.JSON(200, folder)

}

func GetFolderNumberPasswordController(c *gin.Context) {
    id := c.Param("id")
    var count int64

    result := config.DB.Model(&models.Item{}).Where("folder_id = ?", id).Count(&count)
    if result.Error != nil {
        c.JSON(500, gin.H{"error": "Erreur lors du décompte"})
        return
    }

    c.JSON(200, gin.H{"count": count})
}

func GetFolderPasswordsController(c *gin.Context) {
	
}

func CreateFolderController(c *gin.Context) {

	var input struct {
		Name string `json:"name" binding:"required"`
    }

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(500, gin.H{"error": "Invalid Request Data"})
		return
	}

	folder := models.Folder{
        Name: input.Name,
    }

	if err := config.DB.Create(&folder).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed To Create Folder"})
		return
	}

	c.JSON(201, gin.H{
        "message": "Folder Created Successfully",
        "data":    folder,
    })
	
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
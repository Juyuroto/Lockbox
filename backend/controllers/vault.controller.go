package controllers

import (
	"lockbox/config"
	"lockbox/models"
	
	"github.com/gin-gonic/gin"
)

func GetVaultController(c *gin.Context) {
	
	userID := c.MustGet("userID").(uint)

	var vault models.Vault
    if err := config.DB.Where("user_id = ?", userID).First(&vault).Error; err != nil {
        c.JSON(404, gin.H{"error": "Vault not found"})
        return
    }

	c.JSON(200, vault)
}
package controllers

import (
	"lockbox/config"
	"lockbox/models"
	"lockbox/utils"
	
	"github.com/gin-gonic/gin"
)

func GetVaultController(c *gin.Context) {
	
	userID := c.MustGet("userID").(uint)

	var vault models.Vault
    if err := config.DB.Preload("Folders").Preload("Passwords").Where("user_id = ?", userID).First(&vault).Error; err != nil {
        utils.SendError(c, 404, "VAULT_NOT_FOUND", "Vault not found")
        return
    }

	utils.SendSuccess(c, 200, "Vault retrieved successfully", vault)
}
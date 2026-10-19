package controllers

import(
	"time"
	"lockbox/models"
	"lockbox/services"
	"lockbox/config"
	"lockbox/utils"
	
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RefreshTokenController(c *gin.Context) {
	var input struct {
    	Token string `json:"token"`
	}
	
    if err := c.ShouldBindJSON(&input); err != nil {
    	utils.SendError(c, 400, "INVALID_JSON", "Invalid JSON data")
		return
    }

    var token models.RefreshToken
    if err := config.DB.Where("Token = ?", input.Token).First(&token).Error; err != nil {
		utils.SendError(c, 404, "TOKEN_NOT_FOUND", "Token not found")
		return
	}

    if token.Revoked {
    	utils.SendError(c, 401, "TOKEN_REVOKED", "Token revoked")
		return
	}

    if token.ExpiresAt.Before(time.Now()) {
    	utils.SendError(c, 401, "TOKEN_EXPIRED", "Token has expired")
		return
	}

    var user models.User
    if err := config.DB.First(&user, token.UserID).Error; err != nil {
    	utils.SendError(c, 404, "USER_NOT_FOUND", "User not found")
		return
	}
    
    newToken, err := services.GenerateToken(user.ID, user.Email)
    if err != nil {
    	utils.SendError(c, 500, "INTERNAL_SERVER_ERROR", "Error generating token")
		return
	}

    newRefreshToken, err := services.GenerateRefreshToken()
    if err != nil {
    	utils.SendError(c, 500, "INTERNAL_SERVER_ERROR", "Error generating refresh token")
		return
	}

    err = config.DB.Transaction(func(tx *gorm.DB) error {
        if err := tx.Model(&token).Update("revoked", true).Error; err != nil {
            return err
        }
        return tx.Create(&models.RefreshToken{
            UserID:    user.ID,
            Token:     newRefreshToken,
            ExpiresAt: time.Now().Add(services.RefreshTokenLifetime),
            Revoked:   false,
        }).Error
    })
    if err != nil {
    	utils.SendError(c, 500, "INTERNAL_SERVER_ERROR", "Error saving refresh token")
		return
	}

	utils.SendSuccess(c, 200, "Tokens refreshed successfully", gin.H{
		"token": newToken,
		"refresh_token": newRefreshToken,
		"user": gin.H{
			"id":    user.ID,
			"email": user.Email,
		},
	})
}

func RefreshTokenLogoutController(c *gin.Context) {
    var input struct {
        Token string `json:"token"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
    	utils.SendError(c, 400, "INVALID_JSON", "Invalid JSON data")
		return
	}

    var token models.RefreshToken
    if err := config.DB.Where("token = ?", input.Token).First(&token).Error; err != nil {
    	utils.SendError(c, 404, "TOKEN_NOT_FOUND", "Token not found")
		return
	}

    if token.Revoked {
    	utils.SendError(c, 401, "TOKEN_ALREADY_REVOKED", "Token already revoked")
		return
	}

    if err := config.DB.Model(&token).Update("revoked", true).Error; err != nil {
    	utils.SendError(c, 500, "INTERNAL_SERVER_ERROR", "Error revoking token")
		return
	}

    utils.SendSuccess(c, 200, "Logged out successfully", nil)
}
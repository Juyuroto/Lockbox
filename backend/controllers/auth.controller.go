package controllers

import(
	"time"
	"lockbox/models"
	"lockbox/services"
	"lockbox/config"
	
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RefreshTokenController(c *gin.Context) {
	var input struct {
    	Token string `json:"token"`
	}
	
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(400, gin.H{"error": "Invalid JSON data"})
        return
    }

    var token models.RefreshToken
    if err := config.DB.Where("Token = ?", input.Token).First(&token).Error; err != nil {
        c.JSON(404, gin.H{"error": "Token not found"})
        return
    }

    if token.Revoked {
        c.JSON(401, gin.H{"error": "Token revoked"})
        return
    }

    if token.ExpiresAt.Before(time.Now()) {
        c.JSON(401, gin.H{"error": "Token has expired"})
        return
    }

    var user models.User
    if err := config.DB.First(&user, token.UserID).Error; err != nil {
        c.JSON(404, gin.H{"error": "User not found"})
        return
    }
    
    newToken, err := services.GenerateToken(user.ID, user.Email)
    if err != nil {
        c.JSON(500, gin.H{"error": "Error generating token"})
        return
    }

    newRefreshToken, err := services.GenerateRefreshToken()
    if err != nil {
        c.JSON(500, gin.H{"error": "Error generating refresh token"})
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
        c.JSON(500, gin.H{"error": "Error saving refresh token"})
        return
    }

    c.JSON(200, gin.H{
    	"message": "New Token",
     	"token": newToken,
    	"refresh_token": newRefreshToken,
    	"user": gin.H{
        	"id": user.ID,
        	"email": user.Email,
    	},
    })
}

func RefreshTokenLogoutController(c *gin.Context) {
    var input struct {
        Token string `json:"token"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(400, gin.H{"error": "Invalid JSON data"})
        return
    }

    var token models.RefreshToken
    if err := config.DB.Where("token = ?", input.Token).First(&token).Error; err != nil {
        c.JSON(404, gin.H{"error": "Token not found"})
        return
    }

    if token.Revoked {
        c.JSON(401, gin.H{"error": "Token already revoked"})
        return
    }

    if err := config.DB.Model(&token).Update("revoked", true).Error; err != nil {
        c.JSON(500, gin.H{"error": "Error revoking token"})
        return
    }

    c.JSON(200, gin.H{"message": "Logged out successfully"})
}

// 400 StatusBadRequest - 200 StatusOK - 404 StatusNotFound - 500 StatusInternalServerError - 401 StatusUnauthorized - 409 StatusConflict - 201 StatusCreated
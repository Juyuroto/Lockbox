package controllers

import (
	"time"
	"net/url"
	"os"
	"log"

	"lockbox/models"
	"lockbox/services"
	"lockbox/config"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetUserController(c *gin.Context) {
	
	user := []models.User{}
	config.DB.Find(&user)
	c.JSON(200, &user)
	
}

func CreateUserController(c *gin.Context) {

    var input struct {
        Email    string `json:"email"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(400, gin.H{"error": "Invalid JSON data"})
        return
    }

    var existingUser models.User
    if err := config.DB.Where("email = ?", input.Email).First(&existingUser).Error; err == nil {
        c.JSON(409, gin.H{"error": "This email is already in use."})
        return
    }

    token, err := services.GenerateVerificationToken(input.Email)
    if err != nil {
        c.JSON(500, gin.H{"error": "Error generating token"})
        return
    }

    verificationURL := os.Getenv("FRONTEND_URL") + "/verify?token=" + url.QueryEscape(token)

    err = services.SendMail(input.Email, verificationURL)
    
    if err != nil {
    	log.Println("SendMail error:", err)
    	c.JSON(500, gin.H{"error": "Error Send Mail"})
     	return
    }

    c.JSON(200, gin.H{"message": "Mail submit"})
}

func CreateUserCompleteController(c *gin.Context) {

	var input struct {
        Password 	string 		`json:"password"`
        Token		string		`json:"token"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(400, gin.H{"error": "Token invalide ou expiré"})
        return
    }

    email, err := services.VerifyVerificationToken(input.Token)
    if err != nil {
        c.JSON(401, gin.H{"error": "Invalid JSON data"})
        return
    }
    
    var existingUser models.User
    if err := config.DB.Where("email = ?", email).First(&existingUser).Error; err == nil {
        c.JSON(409, gin.H{"error": "This email is already in use."})
        return
    }

    hashed, err := services.HashPassword(input.Password)
    if err != nil {
        c.JSON(500, gin.H{"error": "Error hashing the password"})
        return
    }

    EncryptionKey, err := services.GenerateUserKey()
    if err != nil {
        c.JSON(500, gin.H{"error": "Error creating the security key"})
        return
    }

    user := models.User {
    	Email:			email,
        Password:		hashed,
        EncryptionKey:	EncryptionKey,
    }

    err = config.DB.Transaction(func(tx *gorm.DB) error {
        if err := tx.Create(&user).Error; err != nil {
            return err
        }
    
        vault := models.Vault{UserID: user.ID}
        if err := tx.Create(&vault).Error; err != nil {
            return err
        }
    
        return nil
    })

    c.JSON(200, gin.H{"message": "User created successfully"})
}

func LoginUserController(c *gin.Context) {

    var input struct {
        Email    string `json:"email"`
        Password string `json:"password"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(400, gin.H{"error": "Invalid JSON data"})
        return
    }

    var user models.User
    if err := config.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
        c.JSON(401, gin.H{"error": "User Not Found"})
        return
    }

    if !services.CheckPasswordHash(input.Password, user.Password) {
        c.JSON(401, gin.H{"error": "Incorrect password"})
        return
    }

    accessToken, err := services.GenerateToken(user.ID, user.Email)
    if err != nil {
        c.JSON(500, gin.H{"error": "Error generating token"})
        return
    }

    refreshTokenString, err := services.GenerateRefreshToken()
    if err != nil {
        c.JSON(500, gin.H{"error": "Error generating refresh token"})
        return
    }

    refreshToken := models.RefreshToken{
        UserID:    user.ID,
        Token:     refreshTokenString,
        ExpiresAt: time.Now().Add(time.Hour * 24),
        Revoked:   false,
    }

    if err := config.DB.Create(&refreshToken).Error; err != nil {
        c.JSON(500, gin.H{"error": "Error saving refresh token"})
        return
    }

    c.JSON(200, gin.H{
        "message":       "Login successful",
        "token":         accessToken,
        "refresh_token": refreshTokenString,
        "user": gin.H{
            "id":    user.ID,
            "email": user.Email,
        },
    })
}

func DeleteUserController(c *gin.Context) {

	userID := c.MustGet("userID").(uint)

	if err := config.DB.Delete(&models.User{}, userID).Error; err != nil {
		c.JSON(500, gin.H{"error": "Unable to delete the user"})
		return
	}

	c.JSON(200, gin.H{"message": "User successfully deleted"})
	
}

func UpdateUserController(c *gin.Context) {

	var user models.User

	if err := config.DB.Where("id = ?", c.MustGet("userID").(uint)).First(&user).Error; err != nil {
		c.JSON(404, gin.H{"error": "User not found"})
		return
	}

	var input struct {
        Password 	string 		`json:"password"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(400, gin.H{"error": "Invalid JSON data"})
        return
    }

    newHashedPassword, err := services.HashPassword(input.Password)
	if err != nil {
		c.JSON(500, gin.H{"error": "Error hashing the new password"})
		return
	}

	if err := config.DB.Model(&user).Update("password", newHashedPassword).Error; err != nil {
		c.JSON(500, gin.H{"error": "Unable to update the password"})
		return
	}

	c.JSON(200, gin.H{
		"message": "Password successfully updated",
	})
	
}
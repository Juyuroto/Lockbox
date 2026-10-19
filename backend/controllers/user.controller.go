package controllers

import (
	"time"
	"net/url"
	"os"
	"log"

	"lockbox/models"
	"lockbox/services"
	"lockbox/config"
	"lockbox/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetUserController(c *gin.Context) {
	
	users := []models.User{}
	config.DB.Find(&users)
	utils.SendSuccess(c, 200, "Users retrieved successfully", users)
}

func CreateUserController(c *gin.Context) {

    var input struct {
        Email    string `json:"email"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        utils.SendError(c, 400, "INVALID_JSON", "Invalid JSON data")
        return
    }

    var existingUser models.User
    if err := config.DB.Where("email = ?", input.Email).First(&existingUser).Error; err == nil {
        utils.SendError(c, 409, "EMAIL_IN_USE", "This email is already in use.")
        return
    }

    token, err := services.GenerateVerificationToken(input.Email)
    if err != nil {
        utils.SendError(c, 500, "TOKEN_GENERATION_ERROR", "Error generating token")
        return
    }

    verificationURL := os.Getenv("FRONTEND_URL") + "/verify?token=" + url.QueryEscape(token)

    err = services.SendMail(input.Email, verificationURL)
    
    if err != nil {
    	log.Println("SendMail error:", err)
    	utils.SendError(c, 500, "EMAIL_SEND_ERROR", "Error Send Mail")
     	return
    }

    utils.SendSuccess(c, 200, "Mail submit successfully", nil)
}

func CreateUserCompleteController(c *gin.Context) {

	var input struct {
        Password 	string 		`json:"password"`
        Token		string		`json:"token"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        utils.SendError(c, 400, "INVALID_JSON", "Invalid JSON data")
        return
    }

    email, err := services.VerifyVerificationToken(input.Token)
    if err != nil {
        utils.SendError(c, 401, "INVALID_TOKEN", "Token invalide ou expiré")
        return
    }
    
    var existingUser models.User
    if err := config.DB.Where("email = ?", email).First(&existingUser).Error; err == nil {
        utils.SendError(c, 409, "EMAIL_IN_USE", "This email is already in use.")
        return
    }

    hashed, err := services.HashPassword(input.Password)
    if err != nil {
        utils.SendError(c, 500, "HASH_ERROR", "Error hashing the password")
        return
    }

    EncryptionKey, err := services.GenerateUserKey()
    if err != nil {
        utils.SendError(c, 500, "KEY_GENERATION_ERROR", "Error creating the security key")
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
    if err != nil {
		utils.SendError(c, 500, "INTERNAL_SERVER_ERROR", "Error creating user and vault")
		return
	}

    utils.SendSuccess(c, 201, "User created successfully", nil)
}

func LoginUserController(c *gin.Context) {

    var input struct {
        Email    string `json:"email"`
        Password string `json:"password"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        utils.SendError(c, 400, "INVALID_JSON", "Invalid JSON data")
        return
    }

    var user models.User
    if err := config.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
        utils.SendError(c, 401, "USER_NOT_FOUND", "User Not Found")
        return
    }

    if !services.CheckPasswordHash(input.Password, user.Password) {
        utils.SendError(c, 401, "INCORRECT_PASSWORD", "Incorrect password")
        return
    }

    accessToken, err := services.GenerateToken(user.ID, user.Email)
    if err != nil {
        utils.SendError(c, 500, "TOKEN_GENERATION_ERROR", "Error generating token")
        return
    }

    refreshTokenString, err := services.GenerateRefreshToken()
    if err != nil {
        utils.SendError(c, 500, "TOKEN_GENERATION_ERROR", "Error generating refresh token")
        return
    }

    refreshToken := models.RefreshToken{
        UserID:    user.ID,
        Token:     refreshTokenString,
        ExpiresAt: time.Now().Add(services.RefreshTokenLifetime),
        Revoked:   false,
    }

    if err := config.DB.Create(&refreshToken).Error; err != nil {
        utils.SendError(c, 500, "INTERNAL_SERVER_ERROR", "Error saving refresh token")
        return
    }

    utils.SendSuccess(c, 200, "Login successful", gin.H{
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
		utils.SendError(c, 500, "INTERNAL_SERVER_ERROR", "Unable to delete the user")
		return
	}

	utils.SendSuccess(c, 200, "User successfully deleted", nil)	
}

func UpdateUserController(c *gin.Context) {

	var user models.User

	if err := config.DB.Where("id = ?", c.MustGet("userID").(uint)).First(&user).Error; err != nil {
		utils.SendError(c, 404, "USER_NOT_FOUND", "User not found")
		return
	}

	var input struct {
        Password 	string 		`json:"password"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        utils.SendError(c, 400, "INVALID_JSON", "Invalid JSON data")
        return
    }

    newHashedPassword, err := services.HashPassword(input.Password)
	if err != nil {
		utils.SendError(c, 500, "HASH_ERROR", "Error hashing the new password")
		return
	}

	if err := config.DB.Model(&user).Update("password", newHashedPassword).Error; err != nil {
		utils.SendError(c, 500, "INTERNAL_SERVER_ERROR", "Unable to update the password")
		return
	}

	utils.SendSuccess(c, 200, "Password successfully updated", nil)	
}
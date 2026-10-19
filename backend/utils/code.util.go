package utils

import "github.com/gin-gonic/gin"

func SendSuccess(c *gin.Context, status int, message string, data interface{}) {
	c.JSON(status, gin.H{
		"success": true,
		"status":  status,
		"message": message,
		"data":    data,
	})
}

func SendError(c *gin.Context, status int, code string, message string) {
	c.JSON(status, gin.H{
		"success": false,
		"status":  status,
		"error": gin.H{
			"code":    code,
			"message": message,
		},
	})
}
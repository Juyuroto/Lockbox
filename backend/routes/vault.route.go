package routes

import (
	"lockbox/controllers"
	"lockbox/middlewares"

	"github.com/gin-gonic/gin"
)

func VaultRoute(router *gin.Engine) {
	protected := router.Group("/").Use(middlewares.JwtMiddleware())

	protected.GET("/vault", controllers.GetVaultController)
}
package routes

import(
	"github.com/gin-gonic/gin"
	"lockbox/controllers"
	"lockbox/middlewares"
)

func RefreshTRoute(router *gin.Engine) {

	protected := router.Group("/").Use(middlewares.JwtMiddleware())

	protected.POST("/auth/refresh", controllers.RefreshTokenController)
	protected.POST("/auth/logout", controllers.RefreshTokenLogoutController)
	
}
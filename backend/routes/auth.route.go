package routes

import(
	"github.com/gin-gonic/gin"
	"lockbox/controllers"
)

func RefreshTRoute(router *gin.Engine) {

	router.POST("/auth/refresh", controllers.RefreshTokenController)
	router.POST("/auth/logout", controllers.RefreshTokenLogoutController)

}

package routes

import(
	"github.com/gin-gonic/gin"
	"lockbox/controllers"
)

func RefreshTRoute(router *gin.Engine) {

	// Publiques : elles sont appelées justement quand le token d'accès a expiré.
	// Le refresh token envoyé dans le body sert de preuve.
	router.POST("/auth/refresh", controllers.RefreshTokenController)
	router.POST("/auth/logout", controllers.RefreshTokenLogoutController)

}

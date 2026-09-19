package routes

import(
	"github.com/gin-gonic/gin"
	"lockbox/controllers"
	"lockbox/middlewares"
)

func PasswordRoute(router *gin.Engine) {

	protected := router.Group("/").Use(middlewares.JwtMiddleware())

	protected.GET("/passwords/:id", controllers.GetPasswordByIDController)
	protected.PUT("/passwords/:id", controllers.UpdatePasswordController)
	protected.DELETE("/passwords/:id", controllers.DeletePasswordController)
	protected.POST("/passwords", controllers.CreatePasswordController)
	
}
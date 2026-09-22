package routes

import(
	"github.com/gin-gonic/gin"
	"lockbox/controllers"
	"lockbox/middlewares"
)

func UserRoute(router *gin.Engine) {

	protected := router.Group("/").Use(middlewares.JwtMiddleware())
	
	protected.GET("/user", controllers.GetUserController)
	router.POST("/signup", controllers.CreateUserController)
	router.POST("/signup/complete", controllers.CreateUserCompleteController)
	router.POST("/login", controllers.LoginUserController)
	protected.DELETE("/user/:id", controllers.DeleteUserController)
	protected.PUT("/user/:id", controllers.UpdateUserController)
	
}
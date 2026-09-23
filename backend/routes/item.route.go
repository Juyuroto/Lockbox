package routes

import(
	"github.com/gin-gonic/gin"
	"lockbox/controllers"
	"lockbox/middlewares"
)

func ItemRoute(router *gin.Engine) {

	protected := router.Group("/").Use(middlewares.JwtMiddleware())

	protected.POST("/item", controllers.CreateItemController)
	protected.GET("/items", controllers.GetAllItemController)
	protected.GET("/item/:id", controllers.GetItemByIDController)
	protected.PUT("/item/:id", controllers.UpdateItemController)
	protected.DELETE("/item/:id", controllers.DeleteItemController)
	
}
package routes

import(
	"github.com/gin-gonic/gin"
	"lockbox/controllers"
	"lockbox/middlewares"
)

func FolderRoute(router *gin.Engine) {

	protected := router.Group("/").Use(middlewares.JwtMiddleware())

	protected.GET("/folders/:id", controllers.GetFolderByIDController)
	protected.GET("/folders/:id/number", controllers.GetFolderNumberItemController)
	protected.GET("/folders/:id/item", controllers.GetFolderItemController)
	protected.POST("/folders", controllers.CreateFolderController)
	protected.DELETE("/folders/:id", controllers.DeleteFolderController)
	protected.PUT("/folders/:id", controllers.UpdateFolderController)
	
}
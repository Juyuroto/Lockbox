package routes

import(
	"github.com/gin-gonic/gin"
	"lockbox/controllers"
	"lockbox/middlewares"
)

func FolderRoute(router *gin.Engine) {

	protected := router.Group("/").Use(middlewares.JwtMiddleware())

	protected.GET("/folde/:id", controllers.GetFolderByIDController)
	protected.GET("/folder/:id/item", controllers.GetFolderItemController)
	protected.POST("/folder", controllers.CreateFolderController)
	protected.DELETE("/folder/:id", controllers.DeleteFolderController)
	protected.PUT("/folder/:id", controllers.UpdateFolderController)
	
}
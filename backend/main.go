package main

import (
	"github.com/gin-gonic/gin"
	"lockbox/config"
	"lockbox/middlewares"
	"lockbox/routes"
	"os"
	"log"
)

func main() {

	config.DatbaseConnexion()
	
	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(middlewares.CorsMiddleware())

	routes.UserRoute(router)
	routes.ItemRoute(router)
	routes.FolderRoute(router)
	routes.VaultRoute(router)
	routes.RefreshTRoute(router)

	log.Println("[Serveur] Démarrage immédiat sur le port " + os.Getenv("BACKEND_PORT"))
	if err := router.Run(":" + os.Getenv("BACKEND_PORT")); err != nil {
		log.Fatal("Erreur serveur :", err)
	}
}
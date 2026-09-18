package config

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"lockbox/models"
)

var DB *gorm.DB

func DatbaseConnexion() {
	host := os.Getenv("PostgreHost")
	user := os.Getenv("PostgreUser")
	password := os.Getenv("PostgrePassword")
	dbname := os.Getenv("PostgreName")
	port := os.Getenv("PostgrePort")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s",
		host, user, password, dbname, port)
	
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	
	if err != nil {
		log.Fatal("Impossible de se connecter à la base de données :", err)
	}

	err = db.AutoMigrate(&models.User{}, &models.Vault{}, &models.Folder{}, &models.Password{}, &models.RefreshToken{})

	if err != nil {
		log.Fatal("Erreur lors de la migration des tables : ", err)
	}

	log.Println("Les tables ont bien été créées !")

	DB = db
}
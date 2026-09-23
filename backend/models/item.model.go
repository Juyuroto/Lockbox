package models

import "gorm.io/gorm"

type Item struct {
	gorm.Model
	Type		string		`gorm:"not null" json:"type"`
	Title		string		`gorm:"not null" json:"title"`
	Data		string		`gorm:"type:text;not null" json:"-"`
	UserID		uint		`gorm:"not null" json:"user_id"`
    User		User		`json:"-"`
    VaultID		uint		`gorm:"not null" json:"vault_id"`

	FolderID 	*uint		`json:"folder_id"`
	Folder		Folder		`json:"-"`
}

type PasswordData struct {
	Login		string 		`json:"login" binding:"required"`
	Password	string 		`json:"password" binding:"required"`
	Note		string 		`json:"note"`
}

type ContactData struct {
	FirstName 	string 		`json:"first_name"`
	LastName  	string 		`json:"last_name"`
	Email     	string 		`json:"email" binding:"omitempty,email"`
	Phone     	string 		`json:"phone"`
}
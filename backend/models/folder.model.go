package models

import "gorm.io/gorm"

type Folder struct {
	gorm.Model
	Name      	string     	`gorm:"not null" json:"name"`
	Passwords 	[]Item 		`json:"-"`
	UserID    	uint       	`gorm:"not null" json:"user_id"`
	VaultID 	uint 		`gorm:"not null" json:"vault_id"`
    User      	User       	`json:"-"`
}
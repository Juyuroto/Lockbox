package models

import "gorm.io/gorm"

type Folder struct {
	gorm.Model
	Items    	[]Item 		`json:"-"`
	Name      	string     	`gorm:"not null" json:"name"`
	ParentID	*uint		`json:"parent_id"`
	Children 	[]Folder	`gorm:"foreignKey:ParentID" json:"children"`
	UserID    	uint       	`gorm:"not null" json:"user_id"`
	VaultID 	uint 		`gorm:"not null" json:"vault_id"`
    User      	User       	`json:"-"`
}
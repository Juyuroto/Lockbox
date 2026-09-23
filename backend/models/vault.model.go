package models

import "gorm.io/gorm"

type Vault struct {
    gorm.Model
    UserID    uint		`gorm:"unique; not null" json:"user_id"`
    
    User      User		`json:"-"`
    Folders   []Folder	`json:"folders"`
    Passwords []Item	`json:"passwords"`
}
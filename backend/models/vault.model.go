package models

import "gorm.io/gorm"

type Vault struct {
    gorm.Model
    UserID    uint       `gorm:"not null" json:"user_id"`
    User      User       `json:"-"`
    Folders   []Folder   `json:"folders"`
    Passwords []Password `json:"passwords"`
}
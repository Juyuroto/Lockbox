package models

import (
	"gorm.io/gorm"
	"time"
)
	
type RefreshToken struct {
	gorm.Model
	UserID		uint		`gorm:"not null" json:"-"`
	User		User		`json:"-"`
	Token		string		`gorm:"not null" json:"-"`
	ExpiresAt	time.Time	`gorm:"not null" json:"-"`
	Revoked		bool		`gorm:"default:false" json:"-"`
}
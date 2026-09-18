package services

import (
	"time"
    "os"
	"github.com/golang-jwt/jwt/v5"
	"crypto/rand"
	"encoding/hex"
)

func GenerateToken(userID uint,email string) (string, error) { // génère un JWT 15min
    claims := jwt.MapClaims{
    	"id":   userID,
        "name": email,
        "exp":  time.Now().Add(time.Minute * 15).Unix(),
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}

func GenerateRefreshToken() (string, error) {
    bytes := make([]byte, 32)
    _, err := rand.Read(bytes)
    if err != nil {
        return "", err
    }
    return hex.EncodeToString(bytes), nil
}
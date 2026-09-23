package services

import (
	"time"
    "os"
    "errors"
	"crypto/rand"
	"encoding/hex"

	"github.com/golang-jwt/jwt/v5"
)

func GenerateToken(userID uint,email string) (string, error) { // génère un JWT 15min
    claims := jwt.MapClaims{
    	"id":   userID,
        "name": email,
        "exp":  time.Now().Add(time.Minute * 15).Unix(),
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(os.Getenv("JWT_SECRET_1")))
}

func GenerateVerificationToken(email string) (string, error) { // génère un JWT 2h
    claims := jwt.MapClaims{
        "email":   email,
        "purpose": "email_verification",
        "exp":     time.Now().Add(time.Minute * 25).Unix(),
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(os.Getenv("JWT_SECRET_2")))
}

func GenerateRefreshToken() (string, error) {
    bytes := make([]byte, 32)
    _, err := rand.Read(bytes)
    if err != nil {
        return "", err
    }
    return hex.EncodeToString(bytes), nil
}

func VerifyVerificationToken(tokenString string) (string, error) {
    token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
        return []byte(os.Getenv("JWT_SECRET_2")), nil
    })
    if err != nil || !token.Valid {
        return "", errors.New("invalid or expired token")
    }

    claims, ok := token.Claims.(jwt.MapClaims)
    if !ok {
        return "", errors.New("invalid token claims")
    }

    if claims["purpose"] != "email_verification" {
        return "", errors.New("wrong token purpose")
    }

    email, ok := claims["email"].(string)
    if !ok {
        return "", errors.New("email claim missing")
    }

    return email, nil
}
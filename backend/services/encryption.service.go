package services

import (
	"bytes"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"io"

)

func GenerateUserKey() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(bytes), nil
}

func EncryptionAES(plaintext string, key string) (string, error) {
    keyBytes, err := base64.StdEncoding.DecodeString(key)
    if err != nil {
        return "", err
    }

    block, err := aes.NewCipher(keyBytes)
    if err != nil {
        return "", err
    }

    gcm, err := cipher.NewGCM(block)
    if err != nil {
        return "", err
    }

    nonce := make([]byte, gcm.NonceSize())
    if _, err := rand.Read(nonce); err != nil {
        return "", err
    }

    ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)

    return base64.StdEncoding.EncodeToString(ciphertext), nil
}

func DecryptionAES(ciphertext string, key string) (string, error) {

	keyBytes, err := base64.StdEncoding.DecodeString(key) 
	if err != nil {
		return "", err
	}
	
    // 2. Extraire le nonce (12 premiers bytes)
    // 3. Déchiffrer le reste
    // 4. Retourner le texte en clair
}
package services

import (
	"bytes"
	"html/template"
	"os"

	"github.com/wneessen/go-mail"
)

var (
	MailFrom = os.Getenv("ACME_EMAIL")
	SMTP     = os.Getenv("SMTP_SERVER")
	MyMail   = os.Getenv("MYMAIL")
	Password = os.Getenv("PASSWORD")
)

func SendMail(email string, verificationURL string) error {

	t, err := template.ParseFiles("templates/emails/verify-email.html")

	if err != nil {
		return err
	}

	var body bytes.Buffer

	if err := t.Execute(&body, struct {
    	Email           string
    	VerificationURL string
	}{
    	Email:           email,
    	VerificationURL: verificationURL,
	}); err != nil {
    	return err
	}

	message := mail.NewMsg()
	if err := message.From(MailFrom); err != nil {
		return err
	}

	if err := message.To(email); err != nil {
		return err
	}

	message.Subject("Vérification d'email")
	message.SetBodyString(mail.TypeTextHTML, body.String())
	client, err := mail.NewClient(SMTP, mail.WithSMTPAuth(mail.SMTPAuthAutoDiscover),
		mail.WithUsername(MyMail), mail.WithPassword(Password))
	if err != nil {
		return err
	}
	if err := client.DialAndSend(message); err != nil {
		return err
	}

	return nil
}
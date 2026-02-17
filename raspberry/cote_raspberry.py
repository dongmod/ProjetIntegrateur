#!/usr/bin/env python3

import json
import time
import random
import threading
from datetime import datetime
import logging 
import smtplib


try:
    from websocket import WebSocketApp
    WEBSOCKET_AVAILABLE = True
except ImportError:
    print("â websocket-client non installÃ©")
    print("   Installation: pip3 install websocket-client")
    exit(1)

try:
    import lgpio
    GPIO_AVAILABLE = True
except ImportError as e:
    print(f"â ï¸  lgpio non disponible - Mode simulation ({e})")
    print("   Installation: pip3 install lgpio")
    GPIO_AVAILABLE = False

logging.basicConfig(filename="projet_final.log", level=logging.INFO,
                    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")

def log_event(event):
    logging.info(event)

def send_email(recipient_email,subject,body):  #DONE 
    try:
        sender_email= "vaneza.cgaytan@gmail.com"
        app_password="uawe krte zsoz cgoy"
        message =f"Subject:{subject}\n\n {body}"

        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as connection:
            connection.login(user=sender_email, password=app_password)
            connection.sendmail(sender_email, recipient_email, message)

        print("email envoye")
        log_event(f"Email envoye a {recipient_email}")
        return True 

    except Exception as e:
        print(f"erreur d'email")
        log_event(f"Error SMTP: {e}")
        return False 

# ============================================
# CONFIGURATION - Modifier ces valeurs

DEVICE_ID = "BUTTON--003"  # Ã€ modifier manuellement pour chaque Raspberry Pi
WS_URL = "ws://172.20.10.7:3000/ws"  # Changer localhost par l'IP du serveur

# Configuration GPIO (BCM numbering)
LED_RED_PIN = 20      # GPIO 17
LED_GREEN_PIN = 21    # GPIO 27
BUZZER_PIN = 6       # GPIO 22
BUTTON_PIN = 19       # GPIO 23

# Intervalle d'envoi des mesures (secondes)
MEASUREMENT_INTERVAL = 10

# ============================================
# GESTION GPIO avec lgpio
# ============================================
class GPIOManager:
    """GÃ¨re les composants GPIO physiques avec lgpio"""
    
    def __init__(self):
        self.gpio_initialized = False
        self.chip = None
        
        if GPIO_AVAILABLE:
            try:
                # Ouvrir le chip GPIO
                self.chip = lgpio.gpiochip_open(0)
                
                # Configuration des sorties (LED et Buzzer)
                lgpio.gpio_claim_output(self.chip, LED_RED_PIN, 0)
                lgpio.gpio_claim_output(self.chip, LED_GREEN_PIN, 0)
                lgpio.gpio_claim_output(self.chip, BUZZER_PIN, 0)
                
                # Configuration de l'entrÃ©e (Bouton) avec pull-up
                lgpio.gpio_claim_input(self.chip, BUTTON_PIN, lgpio.SET_PULL_UP)
                
                # Ãtat initial: tout Ã©teint
                lgpio.gpio_write(self.chip, LED_RED_PIN, 0)
                lgpio.gpio_write(self.chip, LED_GREEN_PIN, 0)
                lgpio.gpio_write(self.chip, BUZZER_PIN, 0)
                
                self.gpio_initialized = True
                print(" GPIO initialisÃ© avec succÃ¨s (lgpio)")
                
            except Exception as e:
                print(f" Erreur initialisation GPIO: {e}")
                self.gpio_initialized = False
                self.chip = None
        else:
            print("â¹ï¸  Mode simulation - GPIO non disponible")
    
    def led_red_on(self):
        """Allumer LED rouge"""
        if self.gpio_initialized:
            #lgpio.gpio_write(self.chip, LED_GREEN_PIN,0)
            lgpio.gpio_write(self.chip, LED_RED_PIN, 1)
            print("ð´ LED Rouge: ON")
        else:
            print("ð´ [SIMULATION] LED Rouge: ON")
    
    def led_red_off(self):
        """Ãteindre LED rouge"""
        if self.gpio_initialized:
            lgpio.gpio_write(self.chip, LED_RED_PIN, 0)
            print(" LED Rouge: OFF")
        else:
            print(" [SIMULATION] LED Rouge: OFF")
    
    def led_green_on(self):
        """Allumer LED verte"""
        if self.gpio_initialized:
            lgpio.gpio_write(self.chip, LED_GREEN_PIN, 1)
            print(" LED Verte: ON")
        else:
            print(" [SIMULATION] LED Verte: ON")
    
    def led_green_off(self):
        """Ãteindre LED verte"""
        if self.gpio_initialized:
            lgpio.gpio_write(self.chip, LED_GREEN_PIN, 0)
            print("--> LED Verte: OFF")
        else:
            print("--> [SIMULATION] LED Verte: OFF")
    
    def buzzer_on(self):
        """Activer le buzzer"""
        if self.gpio_initialized:
            lgpio.gpio_write(self.chip, BUZZER_PIN, 1)
            print("--> Buzzer: ON")
        else:
            print("--> [SIMULATION] Buzzer: ON")
    
    def buzzer_off(self):
        """Dessactiver le buzzer"""
        if self.gpio_initialized:
            lgpio.gpio_write(self.chip, BUZZER_PIN, 0)
            print("--> Buzzer: OFF")
        else:
            print("--> [SIMULATION] Buzzer: OFF")
    
    def buzzer_beep(self, duration=0.5):
        """Faire biper le buzzer"""
        self.buzzer_on()
        time.sleep(duration)
        self.buzzer_off()
    
    def is_button_pressed(self):
        """VÃ©rifier si le bouton est pressÃ©"""
        if self.gpio_initialized:
            # Button pressed = LOW (pull-up) = 0
            return lgpio.gpio_read(self.chip, BUTTON_PIN) == 0
        else:
            # Simulation: retourner False
            return False
    
    def cleanup(self):
        """Nettoyer les GPIO"""
        if self.gpio_initialized and self.chip is not None:
            try:
                # Liberer les pins
                lgpio.gpio_free(self.chip, LED_RED_PIN)
                lgpio.gpio_free(self.chip, LED_GREEN_PIN)
                lgpio.gpio_free(self.chip, BUZZER_PIN)
                lgpio.gpio_free(self.chip, BUTTON_PIN)
                
                # Fermer le chip
                lgpio.gpiochip_close(self.chip)
                print("â GPIO nettoyÃ©")
            except Exception as e:
                print(f"â ï¸  Erreur nettoyage GPIO: {e}")

# ============================================
# SIMULATION DES CAPTEURS
# ============================================
class SensorSimulator:
    """Simule les capteurs de tempÃ©rature et mouvement"""
    
    @staticmethod
    def read_temperature():
        """Simule une lecture de temperature (18-28°C)"""
        return round(random.uniform(18.0, 28.0), 2)
    
    @staticmethod
    def detect_movement():
        """Simule la dÃ©tection de mouvement (10% de chance)"""
        return random.random() < 0.1

# ============================================
# CLIENT WEBSOCKET

class IoTClient:
    def __init__(self, device_id, ws_url):
        self.device_id = device_id
        self.ws_url = ws_url
        self.ws = None
        self.authenticated = False
        self.running = False
        self.gpio = GPIOManager()
        
        # Compteurs
        self.measurements_sent = 0
        self.commands_received = 0
    
    def on_open(self, ws):
        """Callback lors de l'ouverture de la connexion"""
        print(f"---> Connexion WebSocket etablie")
        
        # Allumer LED verte pour indiquer connexion
        self.gpio.led_green_on()
        
        # Envoyer l'authentification avec le deviceId
        auth_message = {
            "type": "auth",
            "deviceId": self.device_id
        }
        ws.send(json.dumps(auth_message))
        print(f"ð¤ Authentification envoyÃ©e: {self.device_id}")
    
    def on_message(self, ws, message):
        """Callback lors de la rÃ©ception d'un message"""
        try:
            data = json.loads(message)
            msg_type = data.get("type")
            
            if msg_type == "auth_success":
                self.authenticated = True
                print(f" Authentification rÃ©ussie!")
                print(f" DÃ©marrage de l'envoi des mesures (intervalle: {MEASUREMENT_INTERVAL}s)")
                
                # Bip de confirmation
                self.gpio.buzzer_beep(0.2)
                
            elif msg_type == "measurement_received":
                self.measurements_sent += 1
                measurement_id = data.get('measurementId', 'N/A')
                print(f"â Mesure #{self.measurements_sent} enregistrÃ©e (ID: {measurement_id})")
                
            elif msg_type == "command":
                # GÃ©rer les commandes reÃ§ues du serveur
                self.commands_received += 1
                command = data.get("command", {})
                action = command.get("action")
                print(f"---> Commande #{self.commands_received} reÃ§ue: {action}")
                self.handle_command(action)
                
            elif msg_type == "error":
                error_msg = data.get('message', 'Erreur inconnue')
                print(f"-->Erreur serveur: {error_msg}")
                
                # Allumer LED rouge pour indiquer erreur
                self.gpio.led_red_on()
                self.gpio.led_green_off()
                self.gpio.buzzer_beep(0.1)
                time.sleep(0.1)
                self.gpio.buzzer_beep(0.1)
                
        except json.JSONDecodeError as e:
            print(f" Message non-JSON reÃ§u: {message}")
        except Exception as e:
            print(f" Erreur traitement message: {e}")
    
    def on_error(self, ws, error):
        """Callback lors d'une erreur"""
        print(f" Erreur WebSocket: {error}")
        
        # Allumer LED rouge
        self.gpio.led_red_on()
        self.gpio.led_green_off()
    
    def on_close(self, ws, close_status_code, close_msg):
        """Callback lors de la fermeture de la connexion"""
        print(f" Connexion fermee (Code: {close_status_code})")
        if close_msg:
            print(f"   Message: {close_msg}")
        
        self.authenticated = False
        self.running = False
        
        # Ãteindre LED verte
        self.gpio.led_green_off()
    
    def handle_command(self, action):
        """Gerer les commandes resues du serveur"""
        if action == "led_on" or action == "led_red_on":
            self.gpio.led_red_on()
            
        elif action == "led_off" or action == "led_red_off":
            self.gpio.led_red_off()
            
        elif action == "led_green_on":
            self.gpio.led_green_on()
            
        elif action == "led_green_off":
            self.gpio.led_green_off()
            
        elif action == "buzzer_on":
            self.gpio.buzzer_on()
            
        elif action == "buzzer_off":
            self.gpio.buzzer_off()
            
        elif action == "buzzer_beep":
            self.gpio.buzzer_beep(0.5)
            
        else:
            print(f" Action inconnue: {action}")
    
    def send_measurement(self, value, unit="celsius"):
        """Envoyer une mesure au serveur"""
        if not self.authenticated:
            print(" Non authentifiÃ©, impossible d'envoyer des mesures")
            return False
        
        try:
            measurement = {
                "type": "measurement",
                "deviceId": self.device_id,
                "value": value,
                "unit": unit,
                "timestamp": datetime.now().isoformat()
            }
            
            self.ws.send(json.dumps(measurement))
            print(f"ð Mesure envoyÃ©e: {value} {unit}")
            return True
            
        except Exception as e:
            print(f"â Erreur envoi mesure: {e}")
            return False
    
    def check_button(self):
        """VÃ©rifier l'Ã©tat du bouton"""
        if self.gpio.is_button_pressed():
            print("ð Bouton pressÃ©!")
            log_event("Button detecte ")
            
            # Allumer LED rouge et buzzer
            self.gpio.led_red_on()
            self.gpio.buzzer_beep(0.2)
            
            # Envoyer une alerte
            self.send_measurement(1, "button_press")
            
            # Attendre que le bouton soit relÃ¢chÃ©
            while self.gpio.is_button_pressed():
                time.sleep(0.1)
            
            self.gpio.led_red_off()
    
    def check_movement(self):
        """VÃ©rifier le capteur de mouvement (simulÃ©)"""
        if SensorSimulator.detect_movement():
            print("ð¶ Mouvement dÃ©tectÃ©!")
            
            # Allumer LED rouge et buzzer
            self.gpio.led_green_off()
            self.gpio.led_red_on()
            self.gpio.buzzer_beep(0.3)
            log_event("Movement detecte ")
            send_email(recipient_email="vaneza.cgaytan@gmail.com", subject="Movement ",
                body="movementent dectectee \n\n Verifier les camaras  ")
            print("smtp envoye")
            time.sleep(0.5)
            self.gpio.led_red_off()
            self.gpio.led_green_on()
            
            # Envoyer une alerte
            self.send_measurement(1, "motion_detected")
    
    def measurement_loop(self):
        """Boucle d'envoi des mesures"""
        last_measurement_time = 0
        
        while self.running:
            try:
                current_time = time.time()
                
                # VÃ©rifier le bouton physique
                self.check_button()
                
                # Envoyer une mesure de tempÃ©rature pÃ©riodiquement
                if self.authenticated and (current_time - last_measurement_time) >= MEASUREMENT_INTERVAL:
                    # Lire la tempÃ©rature (simulÃ©e)
                    temperature = SensorSimulator.read_temperature()
                    
                    if self.send_measurement(temperature, "celsius"):
                        last_measurement_time = current_time
                    
                    # Verifier mouvement (simulÃ©)
                    self.check_movement()
                
                time.sleep(0.5)  
                
            except Exception as e:
                print(f"â Erreur dans measurement_loop: {e}")
                time.sleep(1)
    
    def run(self):
        """DÃ©marrer le client"""
        print("   ð€ SYSTÃME IoT - CLIENT RASPBERRY PI (lgpio)")
        print("=" * 60)
        print(f"ð§ Device ID: {self.device_id}")
        print(f"ð URL WebSocket: {self.ws_url}")
        print(f"ð¡ Intervalle mesures: {MEASUREMENT_INTERVAL}s")
        print("=" * 60)
        
        self.running = True
        
        # Configuration WebSocket
        self.ws = WebSocketApp(
            self.ws_url,
            on_open=self.on_open,
            on_message=self.on_message,
            on_error=self.on_error,
            on_close=self.on_close
        )
        
        # Lancer la connexion WebSocket dans un thread
        ws_thread = threading.Thread(target=self.ws.run_forever)
        ws_thread.daemon = True
        ws_thread.start()
        
        print(" Connexion au serveur...")
        
        # Attendre l'authentification
        timeout = 10
        start_time = time.time()
        while not self.authenticated and (time.time() - start_time) < timeout:
            time.sleep(0.5)
        
        if not self.authenticated:
            print("â Ãchec de l'authentification (timeout)")
            self.running = False
            return
        
        # DÃ©marrer la boucle d'envoi de mesures
        try:
            self.measurement_loop()
        except KeyboardInterrupt:
            print("\nð ArrÃªt du client...")
        finally:
            self.cleanup()
    
    def cleanup(self):
        """Nettoyer les ressources"""
        print("\nð Statistiques:")
        print(f"   - Mesures envoyÃ©es: {self.measurements_sent}")
        print(f"   - Commandes reÃ§ues: {self.commands_received}")
        
        self.running = False
        
        if self.ws:
            self.ws.close()
        
        self.gpio.cleanup()
        print(" Nettoyage terminÃ©")

# ============================================
# BOUCLE PRINCIPALE 

if __name__ == "__main__":
 
    if not DEVICE_ID or DEVICE_ID == "PI_001":
        print("modifier DEVICE_ID dans le code!")
        print(f"Valeur actuelle,{DEVICE_ID}")
        response = input("   Continuer quand mÃªme? (o/n): ")
        if response.lower() != 'o':
            print("Arret du programme")
            exit(0)
    
    # CrÃ©er et dÃ©marrer le client
    client = IoTClient(DEVICE_ID, WS_URL)
    
    try:
        client.run()
    except Exception as e:
        print(f" Erreur fatale: {e}")
        import traceback
        traceback.print_exc()
    finally:
        print("\n Au revoir!")
<!-- resources/views/emails/compte-arrete.blade.php -->
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #4F46E5;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-radius: 0 0 5px 5px;
        }
        .info-box {
            background-color: white;
            padding: 15px;
            border-left: 4px solid #4F46E5;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #6b7280;
        }
        .button-link {
        display: inline-block;
        background-color: #4F46E5;
        color: #ffffff !important;
        padding: 12px 22px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
        margin-top: 15px;
    }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Compte Arrêté</h1>
    </div>
    
    <div class="content">
        <p>Bonjour,</p>
        
        <p>Le compte du jour a été arrêté par <strong>{{ $data['emetteur'] }}</strong> ({{ ucfirst($data['role']) }}).</p>
        
        <div class="info-box">
            <p><strong>📅 Période :</strong> {{ $data['date'] }}</p>
            <p><strong>👤 Émetteur :</strong> {{ $data['emetteur'] }}</p>
            <p><strong>🏷️ Rôle :</strong> {{ ucfirst($data['role']) }}</p>
            <p><strong>🕐 Heure :</strong> {{ now()->format('H:i:s') }}</p>
        </div>
        
        <p>Veuillez vérifier les rapports dans l'application pour consulter les détails.</p>
        <p style="text-align:center;">
            <a href="https://app.millaicecream.com/rapports" class="button-link">
                📄 Voir le rapport
            </a>
        </p>

        
        <p>Cordialement,<br>
        <strong>Système de Gestion du Salon</strong></p>
    </div>
    
    <div class="footer">
        <p>Cet email a été généré automatiquement. Merci de ne pas y répondre.</p>
    </div>
</body>
</html>
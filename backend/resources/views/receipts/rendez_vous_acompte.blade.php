<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reçu d'acompte - RDV #{{ $rendezVous->id }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        @page {
            size: 105mm 148mm;
            margin: 0;
        }
        body {
            font-family: 'DejaVu Sans', 'Helvetica', sans-serif;
            font-size: 8px;
            color: #1a1a1a;
            line-height: 1.4;
            padding: 8mm 6mm;
        }
        
        .header {
            display: table;
            width: 100%;
            margin-bottom: 8px;
            padding-bottom: 6px;
            border-bottom: 2px solid #1a1a1a;
        }
        .header-left {
            display: table-cell;
            width: 35%;
            vertical-align: top;
        }
        .logo-container {
            max-width: 30mm;
            max-height: 12mm;
            margin-bottom: 3px;
            overflow: hidden;
        }
        .logo-container img {
            max-width: 100%;
            max-height: 12mm;
            height: auto;
            display: block;
        }
        .salon-name {
            font-size: 9px;
            font-weight: bold;
            color: #1a1a1a;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            line-height: 1.2;
            margin-top: 2px;
        }
        .header-right {
            display: table-cell;
            width: 60%;
            text-align: right;
            font-size: 7px;
            line-height: 1.5;
            vertical-align: top;
        }
        .header-right .info-line {
            margin: 1px 0;
            color: #4a4a4a;
        }
        .header-right .info-line strong {
            color: #1a1a1a;
        }
        
        .receipt-title {
            text-align: center;
            margin: 6px 0;
            padding: 4px 0;
            background: #1a1a1a;
            color: #fff;
            font-size: 9px;
            font-weight: bold;
            letter-spacing: 1px;
        }
        
        .info-section {
            display: table;
            width: 100%;
            margin-bottom: 6px;
            border-spacing: 4px 0;
        }
        .info-block {
            display: table-cell;
            width: 50%;
            background: #f8f8f8;
            padding: 4px;
            border-left: 2px solid #1a1a1a;
            vertical-align: top;
        }
        .info-block-title {
            font-size: 7px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 3px;
            color: #1a1a1a;
        }
        .info-block p {
            font-size: 7px;
            margin: 1.5px 0;
            color: #4a4a4a;
        }
        .info-block p strong {
            color: #1a1a1a;
            min-width: 18mm;
            display: inline-block;
        }
        
        .info-box {
            margin: 5px 0;
            padding: 4px;
            background: #fff;
            border-left: 3px solid #1a1a1a;
            font-size: 7px;
        }
        .info-box-title {
            font-weight: bold;
            margin-bottom: 2px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            font-size: 7px;
        }
        .info-box-content {
            color: #4a4a4a;
            line-height: 1.4;
        }
        
        .payment-box {
            background: #f8f8f8;
            border-left: 3px solid #388e3c;
            padding: 5px;
            margin: 8px 0;
        }
        .payment-amount {
            font-size: 11px;
            font-weight: bold;
            color: #388e3c;
            margin: 3px 0;
        }
        
        .alert-box {
            background: #fff3cd;
            border-left: 3px solid #f57c00;
            padding: 4px;
            margin: 6px 0;
        }
        .alert-text {
            font-size: 7px;
            color: #856404;
            font-weight: bold;
        }
        
        .footer {
            margin-top: 8px;
            padding-top: 5px;
            border-top: 2px solid #1a1a1a;
            text-align: center;
        }
        .thank-you {
            font-size: 9px;
            font-weight: bold;
            margin-bottom: 2px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .print-time {
            font-size: 6px;
            color: #888;
        }
    </style>
</head>
<body>
    <!-- EN-TÊTE -->
    <div class="header">
        <div class="header-left">
            @if($salon && $salon->logo_url)
                <div class="logo-container">
                    <img src="{{ public_path('storage/' . $salon->logo_url) }}" alt="Logo">
                </div>
            @endif
            <div class="salon-name">{{ $salon ? $salon->nom : 'SALON DREADLOCKS' }}</div>
        </div>
        
        <div class="header-right">
            @if($salon)
                <div class="info-line"><strong>Adresse:</strong> {{ $salon->adresse }}</div>
                <div class="info-line"><strong>Tél:</strong> {{ $salon->telephone }}</div>
                @if($salon->email)
                    <div class="info-line"><strong>Email:</strong> {{ $salon->email }}</div>
                @endif
            @endif
        </div>
    </div>

    <!-- TITRE -->
    <div class="receipt-title">REÇU D'ACOMPTE - RENDEZ-VOUS</div>

    <!-- INFORMATIONS -->
    <div class="info-section">
        <div class="info-block">
            <div class="info-block-title">Rendez-vous</div>
            <p><strong>N°:</strong> RDV-{{ str_pad($rendezVous->id, 6, '0', STR_PAD_LEFT) }}</p>
            <p><strong>Date:</strong> {{ \Carbon\Carbon::parse($rendezVous->date_heure)->format('d/m/Y à H:i') }}</p>
            <p><strong>Prestation:</strong> {{ $rendezVous->typePrestation->nom }}</p>
            <p><strong>Durée:</strong> {{ $rendezVous->duree_minutes }} min</p>
            @if($rendezVous->coiffeur)
                <p><strong>Coiffeur:</strong> {{ $rendezVous->coiffeur->prenom }} {{ $rendezVous->coiffeur->nom }}</p>
            @endif
        </div>

        <div class="info-block">
            <div class="info-block-title">Client</div>
            <p><strong>Nom:</strong> {{ $rendezVous->client->prenom }} {{ $rendezVous->client->nom }}</p>
            <p><strong>Tél:</strong> {{ $rendezVous->client->telephone }}</p>
            @if($rendezVous->client->email)
                <p><strong>Email:</strong> {{ $rendezVous->client->email }}</p>
            @endif
        </div>
    </div>

    <!-- DÉTAILS PAIEMENT -->
    @if($paiementAcompte)
        <div class="payment-box">
            <div class="info-box-title">Acompte payé</div>
            <div class="payment-amount">{{ number_format($paiementAcompte->montant, 0, ',', ' ') }} FCFA</div>
            <div class="info-box-content">
                <p><strong>Mode:</strong> {{ ucfirst(str_replace('_', ' ', $paiementAcompte->mode_paiement)) }}</p>
                <p><strong>Date paiement:</strong> {{ \Carbon\Carbon::parse($paiementAcompte->date_paiement)->format('d/m/Y à H:i') }}</p>
                @if($paiementAcompte->reference_transaction)
                    <p><strong>Référence:</strong> {{ $paiementAcompte->reference_transaction }}</p>
                @endif
                @if($paiementAcompte->user)
                    <p><strong>Encaissé par:</strong> {{ $paiementAcompte->user->prenom }} {{ $paiementAcompte->user->nom }}</p>
                @endif
            </div>
        </div>

        <!-- MONTANTS -->
        <div class="info-box">
            <div class="info-box-title">Détails financiers</div>
            <div class="info-box-content">
                @if($rendezVous->prix_estime)
                    <p><strong>Prix estimé prestation:</strong> {{ number_format($rendezVous->prix_estime, 0, ',', ' ') }} FCFA</p>
                @else
                    <p><strong>Prix de base:</strong> {{ number_format($rendezVous->typePrestation->prix_base, 0, ',', ' ') }} FCFA</p>
                @endif
                <p><strong>Acompte versé:</strong> {{ number_format($paiementAcompte->montant, 0, ',', ' ') }} FCFA</p>
                @if($rendezVous->prix_estime)
                    <p><strong>Solde à régler:</strong> {{ number_format($rendezVous->prix_estime - $paiementAcompte->montant, 0, ',', ' ') }} FCFA</p>
                @endif
            </div>
        </div>
    @else
        <div class="alert-box">
            <p class="alert-text">⚠️ Aucun paiement d'acompte trouvé</p>
        </div>
    @endif

    <!-- ALERT RAPPEL -->
    <div class="alert-box">
        <p class="alert-text">⚠️ Le solde restant sera à régler après la prestation</p>
        <p class="alert-text" style="margin-top: 2px;">Merci de présenter ce reçu lors de votre rendez-vous</p>
    </div>

    @if($rendezVous->notes)
        <div class="info-box">
            <div class="info-box-title">Note</div>
            <div class="info-box-content" style="font-style: italic;">
                {{ $rendezVous->notes }}
            </div>
        </div>
    @endif

    <!-- FOOTER -->
    <div class="footer">
        <div class="thank-you">À bientôt !</div>
        <div class="print-time">Imprimé le {{ now()->format('d/m/Y à H:i') }}</div>
    </div>
</body>
</html>
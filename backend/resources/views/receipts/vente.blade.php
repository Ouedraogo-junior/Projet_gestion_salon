<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reçu - {{ $vente->numero_facture }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 12px;
            color: #333;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
        }
        .header h1 {
            font-size: 24px;
            margin-bottom: 5px;
            color: #2c3e50;
        }
        .header p {
            font-size: 11px;
            color: #666;
            margin: 3px 0;
        }
        .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 25px;
        }
        .info-block {
            width: 48%;
        }
        .info-block h3 {
            font-size: 14px;
            margin-bottom: 8px;
            color: #2c3e50;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }
        .info-block p {
            margin: 5px 0;
            font-size: 11px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        table thead {
            background-color: #2c3e50;
            color: white;
        }
        table th {
            padding: 10px;
            text-align: left;
            font-size: 12px;
        }
        table td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
            font-size: 11px;
        }
        table tbody tr:hover {
            background-color: #f5f5f5;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .totals {
            margin-top: 20px;
            text-align: right;
        }
        .totals table {
            width: 300px;
            margin-left: auto;
        }
        .totals table td {
            padding: 8px;
            border: none;
        }
        .totals .grand-total {
            font-size: 16px;
            font-weight: bold;
            background-color: #2c3e50;
            color: white;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 15px;
        }
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: bold;
        }
        .badge-success {
            background-color: #27ae60;
            color: white;
        }
        .badge-warning {
            background-color: #f39c12;
            color: white;
        }
        .signature-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
        }
        .signature-block {
            width: 45%;
            text-align: center;
        }
        .signature-line {
            margin-top: 50px;
            border-top: 1px solid #000;
            padding-top: 5px;
            font-size: 11px;
        }
    </style>
</head>
<body>
    <!-- EN-TÊTE -->
    <div class="header">
        <h1>SALON DREADLOCKS</h1>
        <p>Adresse du salon - Ville, Pays</p>
        <p>Tél: +226 XX XX XX XX | Email: contact@salon-dreadlocks.com</p>
        <p>REÇU DE VENTE</p>
    </div>

    <!-- INFORMATIONS VENTE -->
    <div class="info-section">
        <div class="info-block">
            <h3>Informations Client</h3>
            @if($vente->client)
                <p><strong>Nom:</strong> {{ $vente->client->nom }} {{ $vente->client->prenom }}</p>
                <p><strong>Téléphone:</strong> {{ $vente->client->telephone }}</p>
                @if($vente->client->email)
                    <p><strong>Email:</strong> {{ $vente->client->email }}</p>
                @endif
                @if($vente->client->est_fidele)
                    <p><strong>Points fidélité:</strong> {{ $vente->client->points_fidelite }} pts</p>
                @endif
            @else
                <p>Client anonyme</p>
            @endif
        </div>

        <div class="info-block">
            <h3>Informations Facture</h3>
            <p><strong>N° Facture:</strong> {{ $vente->numero_facture }}</p>
            <p><strong>Date:</strong> {{ $vente->date_vente->format('d/m/Y H:i') }}</p>
            <p><strong>Vendeur:</strong> {{ $vente->user->name }}</p>
            <p><strong>Mode paiement:</strong> {{ ucfirst(str_replace('_', ' ', $vente->mode_paiement)) }}</p>
            <p><strong>Statut:</strong> 
                <span class="badge badge-{{ $vente->statut === 'completee' ? 'success' : 'warning' }}">
                    {{ ucfirst($vente->statut) }}
                </span>
            </p>
        </div>
    </div>

    <!-- DÉTAILS VENTE -->
    <table>
        <thead>
            <tr>
                <th style="width: 40%">Produit/Service</th>
                <th class="text-center" style="width: 15%">Qté</th>
                <th class="text-right" style="width: 20%">Prix Unit.</th>
                <th class="text-right" style="width: 25%">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($vente->details as $detail)
                <tr>
                    <td>
                        <strong>{{ $detail->produit->nom }}</strong>
                        @if($detail->produit->description)
                            <br><small style="color: #666;">{{ Str::limit($detail->produit->description, 50) }}</small>
                        @endif
                    </td>
                    <td class="text-center">{{ $detail->quantite }}</td>
                    <td class="text-right">{{ number_format($detail->prix_unitaire, 0, ',', ' ') }} FCFA</td>
                    <td class="text-right"><strong>{{ number_format($detail->sous_total, 0, ',', ' ') }} FCFA</strong></td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- TOTAUX -->
    <div class="totals">
        <table>
            <tr>
                <td><strong>Sous-total:</strong></td>
                <td class="text-right">{{ number_format($vente->montant_total, 0, ',', ' ') }} FCFA</td>
            </tr>
            <tr class="grand-total">
                <td><strong>TOTAL À PAYER:</strong></td>
                <td class="text-right"><strong>{{ number_format($vente->montant_total, 0, ',', ' ') }} FCFA</strong></td>
            </tr>
        </table>
    </div>

    <!-- NOTES -->
    @if($vente->notes)
        <div style="margin-top: 20px; padding: 10px; background-color: #f9f9f9; border-left: 3px solid #3498db;">
            <strong>Notes:</strong> {{ $vente->notes }}
        </div>
    @endif

    <!-- SIGNATURES -->
    <div class="signature-section">
        <div class="signature-block">
            <div class="signature-line">
                Signature du vendeur
            </div>
        </div>
        <div class="signature-block">
            <div class="signature-line">
                Signature du client
            </div>
        </div>
    </div>

    <!-- PIED DE PAGE -->
    <div class="footer">
        <p><strong>Merci de votre visite !</strong></p>
        <p>Ce reçu fait foi de paiement | Aucun remboursement après 48h</p>
        <p>Imprimé le {{ now()->format('d/m/Y à H:i') }}</p>
    </div>
</body>
</html>
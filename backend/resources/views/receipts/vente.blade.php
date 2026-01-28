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
        .totals .reduction-row {
            color: #e74c3c;
        }
        .totals .reste-row {
            color: #e74c3c;
            font-weight: bold;
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
        .badge-danger {
            background-color: #e74c3c;
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
        .paiements-section {
            margin-top: 20px;
            padding: 10px;
            background-color: #f9f9f9;
            border-left: 3px solid #3498db;
        }
        .paiements-section h4 {
            font-size: 12px;
            margin-bottom: 8px;
            color: #2c3e50;
        }
        .paiement-item {
            padding: 5px 0;
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
                @if($vente->client->points_fidelite)
                    <p><strong>Points fidélité:</strong> {{ $vente->client->points_fidelite }} pts</p>
                @endif
            @elseif($vente->client_nom)
                <p><strong>Nom:</strong> {{ $vente->client_nom }}</p>
                @if($vente->client_telephone)
                    <p><strong>Téléphone:</strong> {{ $vente->client_telephone }}</p>
                @endif
            @else
                <p>Client anonyme</p>
            @endif
        </div>

        <div class="info-block">
            <h3>Informations Facture</h3>
            <p><strong>N° Facture:</strong> {{ $vente->numero_facture }}</p>
            <p><strong>Date:</strong> {{ \Carbon\Carbon::parse($vente->date_vente)->format('d/m/Y H:i') }}</p>
            <p><strong>Vendeur:</strong> {{ $vente->vendeur ? $vente->vendeur->nom : 'Non spécifié' }}</p>
            @if($vente->coiffeur)
                <p><strong>Coiffeur:</strong> {{ $vente->coiffeur->nom }}</p>
            @endif
            <p><strong>Mode paiement:</strong> {{ ucfirst(str_replace('_', ' ', $vente->mode_paiement)) }}</p>
            <p><strong>Type vente:</strong> {{ ucfirst($vente->type_vente) }}</p>
            <p><strong>Statut:</strong> 
                <span class="badge badge-{{ $vente->statut_paiement === 'paye' ? 'success' : ($vente->statut_paiement === 'partiel' ? 'warning' : 'danger') }}">
                    {{ ucfirst($vente->statut_paiement) }}
                </span>
            </p>
        </div>
    </div>

    <!-- DÉTAILS VENTE -->
    <table>
        <thead>
            <tr>
                <th style="width: 5%">#</th>
                <th style="width: 35%">Produit/Service</th>
                <th class="text-center" style="width: 10%">Type</th>
                <th class="text-center" style="width: 10%">Qté</th>
                <th class="text-right" style="width: 20%">Prix Unit.</th>
                <th class="text-right" style="width: 20%">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($vente->details as $index => $detail)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>
                        <strong>{{ $detail->article_nom ?? 'Article inconnu' }}</strong>
                        @if($detail->produit_reference)
                            <br><small style="color: #666;">Réf: {{ $detail->produit_reference }}</small>
                        @endif
                    </td>
                    <td class="text-center">
                        <span class="badge badge-{{ $detail->type_article === 'prestation' ? 'success' : 'warning' }}">
                            {{ ucfirst($detail->type_article) }}
                        </span>
                    </td>
                    <td class="text-center">{{ $detail->quantite }}</td>
                    <td class="text-right">{{ number_format($detail->prix_unitaire, 0, ',', ' ') }} FCFA</td>
                    <td class="text-right">
                        <strong>{{ number_format($detail->prix_total, 0, ',', ' ') }} FCFA</strong>
                        @if($detail->reduction > 0)
                            <br><small style="color: #e74c3c;">-{{ number_format($detail->reduction, 0, ',', ' ') }} FCFA</small>
                        @endif
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- TOTAUX -->
    <div class="totals">
        <table>
            <tr>
                <td><strong>Sous-total HT:</strong></td>
                <td class="text-right">{{ number_format($vente->montant_total_ht, 0, ',', ' ') }} FCFA</td>
            </tr>
            @if($vente->montant_reduction > 0)
            <tr class="reduction-row">
                <td><strong>Réduction:</strong></td>
                <td class="text-right">-{{ number_format($vente->montant_reduction, 0, ',', ' ') }} FCFA</td>
            </tr>
            @endif
            <tr class="grand-total">
                <td><strong>TOTAL À PAYER:</strong></td>
                <td class="text-right"><strong>{{ number_format($vente->montant_total_ttc, 0, ',', ' ') }} FCFA</strong></td>
            </tr>
            @if($vente->montant_paye > 0)
            <tr>
                <td><strong>Montant payé:</strong></td>
                <td class="text-right">{{ number_format($vente->montant_paye, 0, ',', ' ') }} FCFA</td>
            </tr>
            @endif
            @if($vente->montant_rendu > 0)
            <tr>
                <td><strong>Monnaie rendue:</strong></td>
                <td class="text-right">{{ number_format($vente->montant_rendu, 0, ',', ' ') }} FCFA</td>
            </tr>
            @endif
            @if($vente->solde_restant > 0)
            <tr class="reste-row">
                <td><strong>Reste à payer:</strong></td>
                <td class="text-right">{{ number_format($vente->solde_restant, 0, ',', ' ') }} FCFA</td>
            </tr>
            @endif
        </table>
    </div>

    <!-- DÉTAILS PAIEMENTS (si paiements multiples) -->
    @if($vente->paiements && $vente->paiements->count() > 0)
        <div class="paiements-section">
            <h4>Détails des paiements</h4>
            @foreach($vente->paiements as $paiement)
                <div class="paiement-item">
                    <strong>{{ ucfirst(str_replace('_', ' ', $paiement->mode_paiement)) }}:</strong> 
                    {{ number_format($paiement->montant, 0, ',', ' ') }} FCFA
                    @if($paiement->reference)
                        - Réf: {{ $paiement->reference }}
                    @endif
                </div>
            @endforeach
        </div>
    @endif

    <!-- POINTS FIDÉLITÉ -->
    @if($vente->points_utilises > 0 || $vente->points_gagnes > 0)
        <div style="margin-top: 20px; padding: 10px; background-color: #e8f5e9; border-left: 3px solid #27ae60;">
            <strong>Programme fidélité:</strong>
            @if($vente->points_utilises > 0)
                <br>Points utilisés: {{ $vente->points_utilises }} pts
            @endif
            @if($vente->points_gagnes > 0)
                <br>Points gagnés: {{ $vente->points_gagnes }} pts
            @endif
        </div>
    @endif

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
        <p>Imprimé le {{ now()->format('d/m/Y à H:i') }}</p>
    </div>
</body>
</html>
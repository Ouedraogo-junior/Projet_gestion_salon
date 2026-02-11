<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reçu final - RDV #{{ $rendezVous->id }}</title>
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
        
        .items-section {
            margin: 6px 0;
        }
        .section-header {
            font-size: 7px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 3px;
            padding-bottom: 2px;
            border-bottom: 1px solid #1a1a1a;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 3px 0;
        }
        table thead {
            background: #1a1a1a;
            color: #fff;
        }
        table th {
            padding: 3px 2px;
            text-align: left;
            font-size: 7px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        table td {
            padding: 3px 2px;
            border-bottom: 1px solid #e8e8e8;
            font-size: 7px;
        }
        table tbody tr:last-child td {
            border-bottom: 1px solid #1a1a1a;
        }
        .item-name {
            font-weight: 600;
            color: #1a1a1a;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        
        .badge {
            display: inline-block;
            padding: 1px 4px;
            border-radius: 2px;
            font-size: 6px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        .badge-prestation {
            background: #1a1a1a;
            color: #fff;
        }
        .badge-produit {
            background: #e8e8e8;
            color: #1a1a1a;
        }
        
        .totals-section {
            margin-top: 6px;
            padding: 5px;
            background: #f8f8f8;
        }
        .total-line {
            display: table;
            width: 100%;
            padding: 2px 0;
            font-size: 7px;
        }
        .total-line span:first-child {
            display: table-cell;
            text-align: left;
        }
        .total-line span:last-child {
            display: table-cell;
            text-align: right;
        }
        .total-line.subtotal {
            color: #4a4a4a;
        }
        .total-line.acompte {
            color: #388e3c;
            font-style: italic;
        }
        .total-line.grand-total {
            margin-top: 4px;
            padding-top: 4px;
            border-top: 2px solid #1a1a1a;
            font-size: 10px;
            font-weight: bold;
        }
        .total-line.paid,
        .total-line.change {
            font-size: 7px;
            color: #388e3c;
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
    <div class="receipt-title">REÇU FINAL - PRESTATION</div>

    <!-- INFORMATIONS -->
    <div class="info-section">
        <div class="info-block">
            <div class="info-block-title">Facture</div>
            <p><strong>N°:</strong> {{ $vente->numero_facture }}</p>
            <p><strong>RDV N°:</strong> RDV-{{ str_pad($rendezVous->id, 6, '0', STR_PAD_LEFT) }}</p>
            <p><strong>Date:</strong> {{ \Carbon\Carbon::parse($vente->date_vente)->format('d/m/Y H:i') }}</p>
            @if($vente->coiffeur)
                <p><strong>Coiffeur:</strong> {{ $vente->coiffeur->prenom }} {{ $vente->coiffeur->nom }}</p>
            @endif
            <p><strong>Vendeur:</strong> {{ $vente->vendeur->prenom ?? 'N/A' }}</p>
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

    <!-- LISTE DES ARTICLES -->
    <div class="items-section">
        <div class="section-header">Détails</div>
        <table>
            <thead>
                <tr>
                    <th style="width: 45%;">Article</th>
                    <th class="text-center" style="width: 15%;">Type</th>
                    <th class="text-center" style="width: 10%;">Qté</th>
                    <th class="text-right" style="width: 30%;">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($vente->details as $detail)
                    <tr>
                        <td>
                            <div class="item-name">{{ $detail->article_nom }}</div>
                        </td>
                        <td class="text-center">
                            <span class="badge badge-{{ $detail->type_article }}">
                                {{ $detail->type_article === 'prestation' ? 'Service' : 'Produit' }}
                            </span>
                        </td>
                        <td class="text-center">{{ $detail->quantite }}</td>
                        <td class="text-right">
                            <strong>{{ number_format($detail->prix_total, 0, ',', ' ') }}</strong>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <!-- TOTAUX -->
    <div class="totals-section">
        <div class="total-line subtotal">
            <span>Sous-total</span>
            <span>{{ number_format($vente->montant_total_ht, 0, ',', ' ') }} FCFA</span>
        </div>
        
        @if($rendezVous->acompte_paye && $rendezVous->acompte_montant)
            <div class="total-line acompte">
                <span>Acompte déjà versé</span>
                <span>-{{ number_format($rendezVous->acompte_montant, 0, ',', ' ') }} FCFA</span>
            </div>
        @endif
        
        @if($vente->montant_reduction > 0)
            <div class="total-line acompte">
                <span>Réduction</span>
                <span>-{{ number_format($vente->montant_reduction, 0, ',', ' ') }} FCFA</span>
            </div>
        @endif
        
        <div class="total-line grand-total">
            <span>TOTAL À PAYER</span>
            <span>{{ number_format($vente->montant_total_ttc, 0, ',', ' ') }} FCFA</span>
        </div>
        
        <div class="total-line paid">
            <span>Montant payé</span>
            <span>{{ number_format($vente->montant_paye, 0, ',', ' ') }} FCFA</span>
        </div>
        
        @if($vente->montant_rendu > 0)
            <div class="total-line change">
                <span>Monnaie rendue</span>
                <span>{{ number_format($vente->montant_rendu, 0, ',', ' ') }} FCFA</span>
            </div>
        @endif
    </div>

    <!-- DÉTAILS PAIEMENTS -->
    @if($vente->paiements && $vente->paiements->count() > 0)
        <div class="info-box">
            <div class="info-box-title">Modes de paiement</div>
            <div class="info-box-content">
                @php
                    $acomptePaiement = $rendezVous->paiements->where('type_paiement', 'acompte')->first();
                @endphp
                @if($rendezVous->acompte_paye && $rendezVous->acompte_montant && $acomptePaiement)
                    <div style="margin: 1px 0;">
                        • Acompte: <strong>{{ number_format($rendezVous->acompte_montant, 0, ',', ' ') }} FCFA</strong>
                        <span style="font-size: 6px; color: #888;">(Payé le {{ \Carbon\Carbon::parse($acomptePaiement->date_paiement)->format('d/m/Y') }})</span>
                    </div>
                @endif
                @foreach($vente->paiements as $paiement)
                    <div style="margin: 1px 0;">
                        • {{ ucfirst(str_replace('_', ' ', $paiement->mode_paiement)) }}: 
                        <strong>{{ number_format($paiement->montant, 0, ',', ' ') }} FCFA</strong>
                        @if($paiement->reference_transaction)
                            <span style="font-size: 6px; color: #888;">(Réf: {{ $paiement->reference_transaction }})</span>
                        @endif
                    </div>
                @endforeach
            </div>
        </div>
    @endif

    <!-- PROGRAMME FIDÉLITÉ -->
    @if($vente->points_utilises > 0 || $vente->points_gagnes > 0)
        <div class="info-box">
            <div class="info-box-title">Programme fidélité</div>
            <div class="info-box-content">
                @if($vente->points_utilises > 0)
                    <div>• Points utilisés: <strong>{{ $vente->points_utilises }} pts</strong></div>
                @endif
                @if($vente->points_gagnes > 0)
                    <div>• Points gagnés: <strong>{{ $vente->points_gagnes }} pts</strong></div>
                @endif
            </div>
        </div>
    @endif

    <!-- FOOTER -->
    <div class="footer">
        <div class="thank-you">Merci de votre visite !</div>
        <div class="print-time">Imprimé le {{ now()->format('d/m/Y à H:i') }}</div>
    </div>
</body>
</html>
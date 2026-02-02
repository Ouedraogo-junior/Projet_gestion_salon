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
        
        /* En-tête avec logo à gauche et infos à droite */
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
        
        /* Titre centré */
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
        
        /* Sections avec style moderne */
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
        
        /* Tableau moderne */
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
        .item-ref {
            font-size: 6px;
            color: #888;
            font-style: italic;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        
        /* Badge de type */
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
        
        /* Section totaux moderne */
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
        .total-line.reduction {
            color: #d32f2f;
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
        .total-line.remaining {
            font-weight: bold;
            color: #d32f2f;
            background: #fff;
            padding: 3px;
            margin-top: 2px;
        }
        
        /* Box d'informations additionnelles */
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
        
        /* Points fidélité avec style */
        .loyalty-box {
            background: #f8f8f8;
            border-left: 3px solid #1a1a1a;
        }
        
        /* Footer élégant */
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
        
        /* Statut badge */
        .status-badge {
            display: inline-block;
            padding: 2px 5px;
            border-radius: 3px;
            font-size: 7px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        .status-paid {
            background: #388e3c;
            color: #fff;
        }
        .status-partial {
            background: #f57c00;
            color: #fff;
        }
        .status-unpaid {
            background: #d32f2f;
            color: #fff;
        }
    </style>
</head>
<body>
    <!-- EN-TÊTE AVEC LOGO À GAUCHE ET INFOS À DROITE -->
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
                @if($salon->horaires)
                    <div class="info-line">{{ $salon->horaires }}</div>
                @endif
            @else
                <div class="info-line">Adresse du salon</div>
                <div class="info-line">Tél: +226 XX XX XX XX</div>
            @endif
        </div>
    </div>

    <!-- TITRE CENTRÉ -->
    <div class="receipt-title">REÇU DE VENTE</div>

    <!-- INFORMATIONS FACTURE ET CLIENT -->
    <div class="info-section">
        <div class="info-block">
            <div class="info-block-title">Facture</div>
            <p><strong>N°:</strong> {{ $vente->numero_facture }}</p>
            <p><strong>Date:</strong> {{ \Carbon\Carbon::parse($vente->date_vente)->format('d/m/Y H:i') }}</p>
            <p><strong>Vendeur:</strong> {{ $vente->vendeur ? $vente->vendeur->nom : 'N/A' }}</p>
            @if($vente->coiffeur)
                <p><strong>Coiffeur:</strong> {{ $vente->coiffeur->nom }}</p>
            @endif
            <p>
                <strong>Statut:</strong> 
                <span class="status-badge status-{{ $vente->statut_paiement === 'paye' ? 'paid' : ($vente->statut_paiement === 'partiel' ? 'partial' : 'unpaid') }}">
                    {{ $vente->statut_paiement === 'paye' ? 'Payé' : ($vente->statut_paiement === 'partiel' ? 'Partiel' : 'Impayé') }}
                </span>
            </p>
        </div>

        <div class="info-block">
            <div class="info-block-title">Client</div>
            @if($vente->client)
                <p><strong>Nom:</strong> {{ $vente->client->nom }} {{ $vente->client->prenom }}</p>
                <p><strong>Tél:</strong> {{ $vente->client->telephone }}</p>
                @if($vente->client->email)
                    <p><strong>Email:</strong> {{ $vente->client->email }}</p>
                @endif
                @if($vente->client->points_fidelite)
                    <p><strong>Points:</strong> {{ $vente->client->points_fidelite }} pts</p>
                @endif
            @elseif($vente->client_nom)
                <p><strong>Nom:</strong> {{ $vente->client_nom }}</p>
                @if($vente->client_telephone)
                    <p><strong>Tél:</strong> {{ $vente->client_telephone }}</p>
                @endif
            @else
                <p>Client anonyme</p>
            @endif
        </div>
    </div>

    <!-- LISTE DES ARTICLES -->
    <div class="items-section">
        <div class="section-header">Détails de la vente</div>
        <table>
            <thead>
                <tr>
                    <th style="width: 40%;">Article</th>
                    <th class="text-center" style="width: 15%;">Type</th>
                    <th class="text-center" style="width: 10%;">Qté</th>
                    <th class="text-right" style="width: 15%;">P.U.</th>
                    <th class="text-right" style="width: 20%;">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($vente->details as $detail)
                    <tr>
                        <td>
                            <div class="item-name">{{ $detail->article_nom ?? 'Article inconnu' }}</div>
                            @if($detail->produit_reference)
                                <div class="item-ref">Réf: {{ $detail->produit_reference }}</div>
                            @endif
                        </td>
                        <td class="text-center">
                            <span class="badge badge-{{ $detail->type_article }}">
                                {{ $detail->type_article === 'prestation' ? 'Service' : 'Produit' }}
                            </span>
                        </td>
                        <td class="text-center">{{ $detail->quantite }}</td>
                        <td class="text-right">{{ number_format($detail->prix_unitaire, 0, ',', ' ') }}</td>
                        <td class="text-right">
                            <strong>{{ number_format($detail->prix_total, 0, ',', ' ') }}</strong>
                            @if($detail->reduction > 0)
                                <div style="font-size: 6px; color: #d32f2f;">-{{ number_format($detail->reduction, 0, ',', ' ') }}</div>
                            @endif
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <!-- TOTAUX -->
    <div class="totals-section">
        <div class="total-line subtotal">
            <span>Sous-total HT</span>
            <span>{{ number_format($vente->montant_total_ht, 0, ',', ' ') }} FCFA</span>
        </div>
        @if($vente->montant_reduction > 0)
            <div class="total-line reduction">
                <span>Réduction appliquée</span>
                <span>-{{ number_format($vente->montant_reduction, 0, ',', ' ') }} FCFA</span>
            </div>
        @endif
        <div class="total-line grand-total">
            <span>TOTAL À PAYER</span>
            <span>{{ number_format($vente->montant_total_ttc, 0, ',', ' ') }} FCFA</span>
        </div>
        @if($vente->montant_paye > 0)
            <div class="total-line paid">
                <span>Montant payé</span>
                <span>{{ number_format($vente->montant_paye, 0, ',', ' ') }} FCFA</span>
            </div>
        @endif
        @if($vente->montant_rendu > 0)
            <div class="total-line change">
                <span>Monnaie rendue</span>
                <span>{{ number_format($vente->montant_rendu, 0, ',', ' ') }} FCFA</span>
            </div>
        @endif
        @if($vente->solde_restant > 0)
            <div class="total-line remaining">
                <span>RESTE À PAYER</span>
                <span>{{ number_format($vente->solde_restant, 0, ',', ' ') }} FCFA</span>
            </div>
        @endif
    </div>

    <!-- DÉTAILS PAIEMENTS -->
    @if($vente->paiements && $vente->paiements->count() > 0)
        <div class="info-box">
            <div class="info-box-title">Modes de paiement</div>
            <div class="info-box-content">
                @foreach($vente->paiements as $paiement)
                    <div style="margin: 1px 0;">
                        • {{ ucfirst(str_replace('_', ' ', $paiement->mode_paiement)) }}: 
                        <strong>{{ number_format($paiement->montant, 0, ',', ' ') }} FCFA</strong>
                        @if($paiement->reference)
                            <span style="font-size: 6px; color: #888;">(Réf: {{ $paiement->reference }})</span>
                        @endif
                    </div>
                @endforeach
            </div>
        </div>
    @endif

    <!-- PROGRAMME FIDÉLITÉ -->
    @if($vente->points_utilises > 0 || $vente->points_gagnes > 0)
        <div class="info-box loyalty-box">
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

    <!-- NOTES -->
    @if($vente->notes)
        <div class="info-box">
            <div class="info-box-title">Note</div>
            <div class="info-box-content" style="font-style: italic;">
                {{ $vente->notes }}
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
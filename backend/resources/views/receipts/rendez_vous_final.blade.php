<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Reçu final - RDV #{{ $rendezVous->id }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        @page {
            size: 80mm auto;
            margin: 0;
        }

        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 7.5px;
            color: #000;
            line-height: 1.45;
        }

        .page-wrapper { width: 100%; border-collapse: collapse; }
        .page-wrapper td.inner { padding: 4mm 7mm 6mm 7mm; }

        /* ── SÉPARATEURS ── */
        .sep-double { border-top: 2px solid #000; margin: 2mm 0; }
        .sep-single { border-top: 1px solid #000;  margin: 1.5mm 0; }
        .sep-dashed { border-top: 1px dashed #000;  margin: 1.5mm 0; }

        /* ── EN-TÊTE centré (style vente.blade) ── */
        .salon-nom {
            font-size: 13px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-align: center;
        }
        .salon-info { font-size: 7px; color: #333; text-align: center; }

        /* ── BANDEAU TITRE ── */
        .title-band {
            background: #000;
            color: #fff;
            text-align: center;
            font-size: 8px;
            font-weight: bold;
            letter-spacing: 2px;
            padding: 2px 0;
            margin: 1.5mm 0;
        }

        /* ── TABLES INFO (label / valeur) ── */
        .info-table { width: 100%; border-collapse: collapse; }
        .info-table td { font-size: 7.5px; padding: 1.5px 0; vertical-align: top; }
        .info-table td.lbl { width: 40%; color: #555; }
        .info-table td.val { width: 60%; font-weight: bold; }

        /* ── SECTION LABEL ── */
        .section-label { font-size: 6.5px; text-transform: uppercase; color: #555; margin-bottom: 1px; }

        /* ── TABLEAU ARTICLES ── */
        .articles {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            margin: 1mm 0;
        }
        .articles col.c-nom  { width: 42%; }
        .articles col.c-type { width: 18%; }
        .articles col.c-qty  { width: 10%; }
        .articles col.c-tot  { width: 30%; }

        .articles thead { background: #000; color: #fff; }
        .articles th {
            font-size: 6.5px;
            text-transform: uppercase;
            padding: 2px 2px;
            font-weight: bold;
        }
        .articles th.c-nom  { text-align: left; }
        .articles th.c-type { text-align: center; }
        .articles th.c-qty  { text-align: center; }
        .articles th.c-tot  { text-align: right; }

        .articles td {
            font-size: 7px;
            padding: 2px 2px;
            border-bottom: 1px solid #e8e8e8;
            vertical-align: top;
        }
        .articles tbody tr:last-child td { border-bottom: 1px solid #000; }
        .articles td.c-nom  { text-align: left; font-weight: bold; }
        .articles td.c-type { text-align: center; }
        .articles td.c-qty  { text-align: center; }
        .articles td.c-tot  { text-align: right; font-weight: bold; }

        .badge {
            font-size: 6px;
            font-weight: bold;
            text-transform: uppercase;
            padding: 1px 3px;
        }
        .badge-prestation { background: #000; color: #fff; }
        .badge-produit    { background: #e8e8e8; color: #000; }

        /* ── TABLES TOTAUX ── */
        .totaux-table { width: 100%; border-collapse: collapse; }
        .totaux-table td { font-size: 7.5px; padding: 1.5px 0; vertical-align: top; }
        .totaux-table td.t-lbl { text-align: left;  width: 60%; }
        .totaux-table td.t-val { text-align: right; width: 40%; font-weight: bold; }

        .totaux-table tr.grand-total td { font-size: 11px; font-weight: bold; }
        .totaux-table tr.subtotal  td   { color: #555; }
        .totaux-table tr.acompte   td   { color: #388e3c; font-style: italic; }
        .totaux-table tr.reduction td   { color: #cc0000; font-style: italic; }
        .totaux-table tr.paid      td   { color: #006600; }
        .totaux-table tr.change    td   { color: #006600; }

        /* ── TABLES DÉTAIL (paiements / fidélité) ── */
        .detail-table { width: 100%; border-collapse: collapse; }
        .detail-table td { font-size: 7.5px; padding: 1px 0; vertical-align: top; }
        .detail-table td.d-lbl { text-align: left;  width: 60%; }
        .detail-table td.d-val { text-align: right; width: 40%; font-weight: bold; }
        .detail-table td.d-ref { font-size: 6.5px; color: #555; padding-left: 8px; }

        /* ── FOOTER ── */
        .footer     { text-align: center; margin-top: 2mm; }
        .merci      { font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
        .small-gray { font-size: 6.5px; color: #777; }
    </style>
</head>
<body>

<table class="page-wrapper">
<tr><td class="inner">

    {{-- ══════════════════════════════════════════════
         LOGO DU SALON — décommenter pour activer
         Nécessite : $salon->logo_url = chemin relatif
         depuis storage/app/public/
         Exemple   : "logos/mon-logo.png"
    ══════════════════════════════════════════════ --}}
    {{--
    @if($salon && $salon->logo_url)
        @php
            $logoPath   = storage_path('app/public/' . $salon->logo_url);
            $logoBase64 = null;
            if (file_exists($logoPath)) {
                $ext     = strtolower(pathinfo($logoPath, PATHINFO_EXTENSION));
                $mimeMap = ['png'=>'image/png','jpg'=>'image/jpeg','jpeg'=>'image/jpeg','gif'=>'image/gif','webp'=>'image/webp'];
                $mime    = $mimeMap[$ext] ?? 'image/png';
                $logoBase64 = 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($logoPath));
            }
        @endphp
        @if($logoBase64)
            <div style="text-align:center; margin-bottom:2mm;">
                <img src="{{ $logoBase64 }}" style="max-width:28mm; max-height:14mm;" alt="Logo">
            </div>
        @endif
    @endif
    --}}

    {{-- ── EN-TÊTE ── --}}
    <div class="salon-nom">{{ $salon->nom ?? 'SALON' }}</div>
    @if($salon)
        @if($salon->adresse)<div class="salon-info">{{ $salon->adresse }}</div>@endif
        @if($salon->telephone)<div class="salon-info">Tél : {{ $salon->telephone }}</div>@endif
        @if($salon->email)<div class="salon-info">{{ $salon->email }}</div>@endif
    @endif

    <div class="title-band">— REÇU FINAL — PRESTATION —</div>

    {{-- ── INFOS FACTURE ── --}}
    <table class="info-table">
        <tr>
            <td class="lbl">N° Facture</td>
            <td class="val">{{ $vente->numero_facture }}</td>
        </tr>
        <tr>
            <td class="lbl">N° RDV</td>
            <td class="val">RDV-{{ str_pad($rendezVous->id, 6, '0', STR_PAD_LEFT) }}</td>
        </tr>
        <tr>
            <td class="lbl">Date</td>
            <td class="val">{{ \Carbon\Carbon::parse($vente->date_vente)->format('d/m/Y H:i') }}</td>
        </tr>
        @if($vente->coiffeur)
        <tr>
            <td class="lbl">Coiffeur</td>
            <td class="val">{{ $vente->coiffeur->prenom }} {{ $vente->coiffeur->nom }}</td>
        </tr>
        @endif
        <tr>
            <td class="lbl">Vendeur</td>
            <td class="val">{{ $vente->vendeur->prenom ?? 'N/A' }} {{ $vente->vendeur->nom ?? '' }}</td>
        </tr>
    </table>

    <div class="sep-dashed"></div>

    {{-- ── CLIENT ── --}}
    <table class="info-table">
        <tr>
            <td class="lbl">Client</td>
            <td class="val">{{ $rendezVous->client->prenom }} {{ $rendezVous->client->nom }}</td>
        </tr>
        <tr>
            <td class="lbl">Tél</td>
            <td class="val">{{ $rendezVous->client->telephone }}</td>
        </tr>
        @if($rendezVous->client->email)
        <tr>
            <td class="lbl">Email</td>
            <td class="val">{{ $rendezVous->client->email }}</td>
        </tr>
        @endif
    </table>

    <div class="sep-double"></div>

    {{-- ── ARTICLES ── --}}
    <div class="section-label">Détails</div>
    <table class="articles">
        <colgroup>
            <col class="c-nom">
            <col class="c-type">
            <col class="c-qty">
            <col class="c-tot">
        </colgroup>
        <thead>
            <tr>
                <th class="c-nom">Article</th>
                <th class="c-type">Type</th>
                <th class="c-qty">Qté</th>
                <th class="c-tot">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($vente->details as $detail)
            <tr>
                <td class="c-nom">{{ $detail->article_nom }}</td>
                <td class="c-type">
                    <span class="badge badge-{{ $detail->type_article }}">
                        {{ $detail->type_article === 'prestation' ? 'Service' : 'Produit' }}
                    </span>
                </td>
                <td class="c-qty">{{ $detail->quantite }}</td>
                <td class="c-tot">{{ number_format($detail->prix_total, 0, ',', ' ') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="sep-single"></div>

    {{-- ── TOTAUX ── --}}
    <table class="totaux-table">
        <tr class="subtotal">
            <td class="t-lbl">Sous-total</td>
            <td class="t-val">{{ number_format($vente->montant_total_ht, 0, ',', ' ') }} FCFA</td>
        </tr>
        @if($rendezVous->acompte_paye && $rendezVous->acompte_montant)
        <tr class="acompte">
            <td class="t-lbl">Acompte versé</td>
            <td class="t-val">-{{ number_format($rendezVous->acompte_montant, 0, ',', ' ') }} FCFA</td>
        </tr>
        @endif
        @if($vente->montant_reduction > 0)
        <tr class="reduction">
            <td class="t-lbl">Réduction</td>
            <td class="t-val">-{{ number_format($vente->montant_reduction, 0, ',', ' ') }} FCFA</td>
        </tr>
        @endif
        <tr><td colspan="2"><div class="sep-single"></div></td></tr>
        <tr class="grand-total">
            <td class="t-lbl">TOTAL À PAYER</td>
            <td class="t-val">{{ number_format($vente->montant_total_ttc, 0, ',', ' ') }} FCFA</td>
        </tr>
        <tr><td colspan="2"><div class="sep-single"></div></td></tr>
        <tr class="paid">
            <td class="t-lbl">Montant payé</td>
            <td class="t-val">{{ number_format($vente->montant_paye, 0, ',', ' ') }} FCFA</td>
        </tr>
        @if($vente->montant_rendu > 0)
        <tr class="change">
            <td class="t-lbl">Monnaie rendue</td>
            <td class="t-val">{{ number_format($vente->montant_rendu, 0, ',', ' ') }} FCFA</td>
        </tr>
        @endif
    </table>

    {{-- ── MODES DE PAIEMENT ── --}}
    @if($vente->paiements && $vente->paiements->count() > 0)
        <div class="sep-dashed"></div>
        <div class="section-label">Mode(s) de paiement</div>
        <table class="detail-table">
            @php
                $acomptePaiement = ($rendezVous->paiements && $rendezVous->paiements->count() > 0)
                    ? $rendezVous->paiements->where('type_paiement', 'acompte')->first()
                    : null;
            @endphp
            @if($rendezVous->acompte_paye && $rendezVous->acompte_montant && $acomptePaiement)
            <tr>
                <td class="d-lbl">• Acompte</td>
                <td class="d-val">{{ number_format($rendezVous->acompte_montant, 0, ',', ' ') }} FCFA</td>
            </tr>
            <tr>
                <td class="d-ref" colspan="2">{{ \Carbon\Carbon::parse($acomptePaiement->date_paiement)->format('d/m/Y') }}</td>
            </tr>
            @endif
            @foreach($vente->paiements as $paiement)
            <tr>
                <td class="d-lbl">• {{ ucfirst(str_replace('_', ' ', $paiement->mode_paiement)) }}</td>
                <td class="d-val">{{ number_format($paiement->montant, 0, ',', ' ') }} FCFA</td>
            </tr>
            @if($paiement->reference_transaction)
            <tr>
                <td class="d-ref" colspan="2">Réf : {{ $paiement->reference_transaction }}</td>
            </tr>
            @endif
            @endforeach
        </table>
    @endif

    {{-- ── PROGRAMME FIDÉLITÉ ── --}}
    @if($vente->points_utilises > 0 || $vente->points_gagnes > 0)
        <div class="sep-dashed"></div>
        <div class="section-label">Programme fidélité</div>
        <table class="detail-table">
            @if($vente->points_utilises > 0)
            <tr>
                <td class="d-lbl">Points utilisés</td>
                <td class="d-val">-{{ $vente->points_utilises }} pts</td>
            </tr>
            @endif
            @if($vente->points_gagnes > 0)
            <tr>
                <td class="d-lbl">Points gagnés</td>
                <td class="d-val">+{{ $vente->points_gagnes }} pts</td>
            </tr>
            @endif
        </table>
    @endif

    {{-- ── FOOTER ── --}}
    <div class="sep-double"></div>
    <div class="footer">
        <div class="merci">Merci de votre visite !</div>
        <div class="small-gray" style="margin-top:2px;">Edité le {{ \Carbon\Carbon::now()->format('d/m/Y à H:i') }}</div>
    </div>

</td></tr>
</table>

</body>
</html>
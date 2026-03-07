<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Reçu - {{ $vente->numero_facture }}</title>
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

        /*
         * SOLUTION DOMPDF pour les marges :
         * @page margin est ignoré par certaines versions de DomPDF.
         * On utilise une table wrapper qui occupe 100% de la page
         * avec une cellule intérieure qui a du padding — c'est la seule
         * méthode garantie pour avoir des marges gauche/droite en DomPDF.
         */
        .page-wrapper {
            width: 100%;
            border-collapse: collapse;
        }
        .page-wrapper td.inner {
            padding: 4mm 7mm 6mm 7mm;
        }

        /* ── SÉPARATEURS ── */
        .sep-double { border-top: 2px solid #000; margin: 2mm 0; }
        .sep-single { border-top: 1px solid #000;  margin: 1.5mm 0; }
        .sep-dashed { border-top: 1px dashed #000;  margin: 1.5mm 0; }

        /* ── EN-TÊTE ── */
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
        .info-table td {
            font-size: 7.5px;
            padding: 1.5px 0;
            vertical-align: top;
        }
        .info-table td.lbl { width: 40%; color: #555; }
        .info-table td.val { width: 60%; font-weight: bold; }

        /* ── STATUT ── */
        .statut {
            font-size: 6.5px;
            font-weight: bold;
            padding: 0 3px;
            border: 1px solid;
        }
        .statut-paye    { border-color: #006600; color: #006600; }
        .statut-partiel { border-color: #bb6600; color: #bb6600; }
        .statut-impaye  { border-color: #cc0000; color: #cc0000; }

        /* ── TABLEAU ARTICLES ── */
        .articles {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            margin: 1mm 0;
        }
        .articles col.c-nom { width: 44%; }
        .articles col.c-qty { width: 10%; }
        .articles col.c-pu  { width: 23%; }
        .articles col.c-tot { width: 23%; }

        .articles th {
            font-size: 6.5px;
            text-transform: uppercase;
            border-bottom: 1px solid #000;
            padding: 1px 1px 2px 1px;
            font-weight: bold;
        }
        .articles th.c-nom { text-align: left; }
        .articles th.c-qty { text-align: center; }
        .articles th.c-pu  { text-align: right; }
        .articles th.c-tot { text-align: right; }

        .articles td {
            font-size: 7.5px;
            padding: 2px 1px;
            border-bottom: 1px dashed #bbb;
            vertical-align: top;
        }
        .articles td.c-nom { text-align: left; }
        .articles td.c-qty { text-align: center; }
        .articles td.c-pu  { text-align: right; }
        .articles td.c-tot { text-align: right; font-weight: bold; }

        .art-type { font-size: 6px; color: #666; font-style: italic; }
        .art-red  { font-size: 6px; color: #cc0000; }

        /* ── TABLES TOTAUX ── */
        .totaux-table { width: 100%; border-collapse: collapse; }
        .totaux-table td { font-size: 7.5px; padding: 1.5px 0; vertical-align: top; }
        .totaux-table td.t-lbl { text-align: left;  width: 60%; }
        .totaux-table td.t-val { text-align: right; width: 40%; font-weight: bold; }

        .totaux-table tr.grand-total td { font-size: 11px; font-weight: bold; }
        .totaux-table tr.subtotal  td   { color: #555; }
        .totaux-table tr.reduction td   { color: #cc0000; font-style: italic; }
        .totaux-table tr.paid      td   { color: #006600; }
        .totaux-table tr.remaining td   { color: #cc0000; font-weight: bold; font-size: 8.5px; }

        /* ── TABLES DÉTAIL (paiements / fidélité) ── */
        .detail-table { width: 100%; border-collapse: collapse; }
        .detail-table td { font-size: 7.5px; padding: 1px 0; vertical-align: top; }
        .detail-table td.d-lbl { text-align: left;  width: 60%; }
        .detail-table td.d-val { text-align: right; width: 40%; font-weight: bold; }
        .detail-table td.d-ref { font-size: 6.5px; color: #555; padding-left: 8px; }

        /* ── SECTION LABEL ── */
        .section-label {
            font-size: 6.5px;
            text-transform: uppercase;
            color: #555;
            margin-bottom: 1px;
        }

        /* ── FOOTER ── */
        .footer     { text-align: center; margin-top: 2mm; }
        .merci      { font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
        .small-gray { font-size: 6.5px; color: #777; }
    </style>
</head>
<body>

{{-- Table wrapper : seule façon fiable d'avoir des marges en DomPDF --}}
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

    <div class="title-band">— REÇU DE VENTE —</div>

    {{-- ── INFOS FACTURE ── --}}
    <table class="info-table">
        <tr>
            <td class="lbl">N° Facture</td>
            <td class="val">{{ $vente->numero_facture }}</td>
        </tr>
        <tr>
            <td class="lbl">Date</td>
            <td class="val">{{ \Carbon\Carbon::parse($vente->date_vente)->format('d/m/Y H:i') }}</td>
        </tr>
        <tr>
            <td class="lbl">Vendeur</td>
            <td class="val">{{ $vente->vendeur?->prenom }} {{ $vente->vendeur?->nom }}</td>
        </tr>
        @if($vente->coiffeur)
        <tr>
            <td class="lbl">Coiffeur</td>
            <td class="val">{{ $vente->coiffeur->prenom }} {{ $vente->coiffeur->nom }}</td>
        </tr>
        @endif
        <tr>
            <td class="lbl">Statut</td>
            <td class="val">
                @php
                    $statutClass = match($vente->statut_paiement) {
                        'paye'    => 'statut-paye',
                        'partiel' => 'statut-partiel',
                        default   => 'statut-impaye',
                    };
                    $statutLabel = match($vente->statut_paiement) {
                        'paye'    => 'PAYÉ',
                        'partiel' => 'PARTIEL',
                        default   => 'IMPAYÉ',
                    };
                @endphp
                <span class="statut {{ $statutClass }}">{{ $statutLabel }}</span>
            </td>
        </tr>
    </table>

    <div class="sep-dashed"></div>

    {{-- ── CLIENT ── --}}
    <table class="info-table">
        @if($vente->client)
            <tr>
                <td class="lbl">Client</td>
                <td class="val">{{ $vente->client->prenom }} {{ $vente->client->nom }}</td>
            </tr>
            @if($vente->client->telephone)
            <tr>
                <td class="lbl">Tél</td>
                <td class="val">{{ $vente->client->telephone }}</td>
            </tr>
            @endif
            @if($vente->client->points_fidelite !== null)
            <tr>
                <td class="lbl">Pts fidélité</td>
                <td class="val">{{ $vente->client->points_fidelite }} pts</td>
            </tr>
            @endif
        @elseif($vente->client_nom)
            <tr>
                <td class="lbl">Client</td>
                <td class="val">{{ $vente->client_nom }}</td>
            </tr>
            @if($vente->client_telephone)
            <tr>
                <td class="lbl">Tél</td>
                <td class="val">{{ $vente->client_telephone }}</td>
            </tr>
            @endif
        @else
            <tr>
                <td class="lbl">Client</td>
                <td class="val" style="color:#555;">Anonyme</td>
            </tr>
        @endif
    </table>

    <div class="sep-double"></div>

    {{-- ── ARTICLES ── --}}
    <table class="articles">
        <colgroup>
            <col class="c-nom">
            <col class="c-qty">
            <col class="c-pu">
            <col class="c-tot">
        </colgroup>
        <thead>
            <tr>
                <th class="c-nom">Article</th>
                <th class="c-qty">Qté</th>
                <th class="c-pu">P.U.</th>
                <th class="c-tot">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($vente->details as $d)
            <tr>
                <td class="c-nom">
                    {{ $d->article_nom }}
                    <div class="art-type">{{ $d->type_article === 'prestation' ? 'Service' : 'Produit' }}</div>
                    @if($d->reduction > 0)
                        <div class="art-red">-{{ number_format($d->reduction, 0, ',', ' ') }} F</div>
                    @endif
                </td>
                <td class="c-qty">{{ $d->quantite }}</td>
                <td class="c-pu">{{ number_format($d->prix_unitaire, 0, ',', ' ') }}</td>
                <td class="c-tot">{{ number_format($d->prix_total - ($d->reduction ?? 0), 0, ',', ' ') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="sep-single"></div>

    {{-- ── TOTAUX ── --}}
    <table class="totaux-table">
        @if($vente->montant_prestations > 0 && $vente->montant_produits > 0)
        <tr class="subtotal">
            <td class="t-lbl">Services</td>
            <td class="t-val">{{ number_format($vente->montant_prestations, 0, ',', ' ') }} F</td>
        </tr>
        <tr class="subtotal">
            <td class="t-lbl">Produits</td>
            <td class="t-val">{{ number_format($vente->montant_produits, 0, ',', ' ') }} F</td>
        </tr>
        @endif
        @if($vente->montant_reduction > 0)
        <tr class="reduction">
            <td class="t-lbl">Réduction</td>
            <td class="t-val">-{{ number_format($vente->montant_reduction, 0, ',', ' ') }} F</td>
        </tr>
        @endif
        <tr><td colspan="2"><div class="sep-single"></div></td></tr>
        <tr class="grand-total">
            <td class="t-lbl">TOTAL</td>
            <td class="t-val">{{ number_format($vente->montant_total_ttc, 0, ',', ' ') }} FCFA</td>
        </tr>
        <tr><td colspan="2"><div class="sep-single"></div></td></tr>
        @if($vente->montant_paye > 0)
        <tr class="paid">
            <td class="t-lbl">Payé</td>
            <td class="t-val">{{ number_format($vente->montant_paye, 0, ',', ' ') }} F</td>
        </tr>
        @endif
        @if($vente->montant_rendu > 0)
        <tr class="paid">
            <td class="t-lbl">Rendu monnaie</td>
            <td class="t-val">{{ number_format($vente->montant_rendu, 0, ',', ' ') }} F</td>
        </tr>
        @endif
        @if($vente->solde_restant > 0)
        <tr class="remaining">
            <td class="t-lbl">RESTE A PAYER</td>
            <td class="t-val">{{ number_format($vente->solde_restant, 0, ',', ' ') }} F</td>
        </tr>
        @endif
    </table>

    {{-- ── DÉTAIL PAIEMENTS ── --}}
    @if($vente->paiements?->count() > 0)
        <div class="sep-dashed"></div>
        <div class="section-label">Mode(s) de paiement</div>
        <table class="detail-table">
            @foreach($vente->paiements as $p)
            <tr>
                <td class="d-lbl">• {{ ucfirst(str_replace('_', ' ', $p->mode_paiement)) }}</td>
                <td class="d-val">{{ number_format($p->montant, 0, ',', ' ') }} FCFA</td>
            </tr>
            @if($p->reference_transaction)
            <tr>
                <td class="d-ref" colspan="2">Réf : {{ $p->reference_transaction }}</td>
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
            @if($vente->client?->points_fidelite !== null)
            <tr>
                <td class="d-lbl" style="color:#555;">Solde actuel</td>
                <td class="d-val" style="color:#555;">{{ $vente->client->points_fidelite }} pts</td>
            </tr>
            @endif
        </table>
    @endif

    {{-- ── NOTES ── --}}
    @if($vente->notes)
        <div class="sep-dashed"></div>
        <div style="font-size:7px; color:#555; font-style:italic; line-height:1.4;">{{ $vente->notes }}</div>
    @endif

    {{-- ── FOOTER ── --}}
    <div class="sep-double"></div>
    <div class="footer">
        <div class="merci">Merci de votre visite !</div>
        @if($salon?->slogan)
            <div style="font-size:7px; color:#555; font-style:italic; margin-top:1px;">{{ $salon->slogan }}</div>
        @endif
        <div class="small-gray" style="margin-top:2px;">Edité le {{ \Carbon\Carbon::now()->format('d/m/Y à H:i') }}</div>
    </div>

</td></tr>
</table>

</body>
</html>
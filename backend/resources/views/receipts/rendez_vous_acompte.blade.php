<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Reçu d'acompte - RDV #{{ $rendezVous->id }}</title>
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

        /* ── BLOC INFO 2 COLONNES (RDV | CLIENT) ── */
        .two-col-table { width: 100%; border-collapse: collapse; margin-bottom: 2mm; }
        .two-col-table td { vertical-align: top; padding: 0; }
        .two-col-table td.col-left  { width: 50%; padding-right: 2mm; }
        .two-col-table td.col-right { width: 50%; padding-left: 2mm; }

        .block-box { background: #f8f8f8; padding: 3px 4px; border-left: 2px solid #000; }
        .block-title {
            font-size: 7px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
        }

        /* ── TABLE LIGNES LABEL/VALEUR ── */
        .kv-table { width: 100%; border-collapse: collapse; }
        .kv-table td { font-size: 7px; padding: 1px 0; color: #555; vertical-align: top; }
        .kv-table td.k { width: 42%; color: #000; font-weight: bold; }
        .kv-table td.v { width: 58%; }

        /* ── BLOC PAIEMENT ── */
        .payment-box {
            background: #f8f8f8;
            border-left: 3px solid #388e3c;
            padding: 4px 5px;
            margin: 2mm 0;
        }
        .payment-title { font-size: 7px; font-weight: bold; text-transform: uppercase; margin-bottom: 2px; }
        .payment-amount { font-size: 13px; font-weight: bold; color: #388e3c; margin: 2px 0; }

        /* ── BLOC DÉTAILS FINANCIERS ── */
        .finance-box { border-left: 3px solid #000; padding: 3px 5px; margin: 2mm 0; }
        .finance-title { font-size: 7px; font-weight: bold; text-transform: uppercase; margin-bottom: 2px; }

        /* ── BLOC ALERTE ── */
        .alert-box { border-left: 3px solid #f57c00; padding: 3px 5px; margin: 2mm 0; background: #fff8f0; }
        .alert-text { font-size: 7px; color: #856404; font-weight: bold; margin: 1px 0; }

        /* ── SECTION LABEL ── */
        .section-label { font-size: 6.5px; text-transform: uppercase; color: #555; margin-bottom: 1px; }

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

    <div class="title-band">— REÇU D'ACOMPTE —</div>

    {{-- ── INFOS RDV ── --}}
    <table class="info-table">
        <tr>
            <td class="lbl">N° RDV</td>
            <td class="val">RDV-{{ str_pad($rendezVous->id, 6, '0', STR_PAD_LEFT) }}</td>
        </tr>
        <tr>
            <td class="lbl">Date RDV</td>
            <td class="val">{{ \Carbon\Carbon::parse($rendezVous->date_heure)->format('d/m/Y à H:i') }}</td>
        </tr>
        <tr>
            <td class="lbl">Durée</td>
            <td class="val">{{ $rendezVous->duree_minutes }} min</td>
        </tr>
        @if($rendezVous->coiffeur)
        <tr>
            <td class="lbl">Coiffeur</td>
            <td class="val">{{ $rendezVous->coiffeur->prenom }} {{ $rendezVous->coiffeur->nom }}</td>
        </tr>
        @endif
        <tr>
            <td class="lbl">Prestation</td>
            <td class="val">
                @if($rendezVous->prestations && $rendezVous->prestations->count() > 0)
                    {{ $rendezVous->prestations->pluck('nom')->join(', ') }}
                @elseif($rendezVous->typePrestation)
                    {{ $rendezVous->typePrestation->nom }}
                @else
                    N/A
                @endif
            </td>
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

    {{-- ── PAIEMENT ACOMPTE ── --}}
    @if($paiementAcompte)

        <div class="payment-box">
            <div class="payment-title">Acompte encaissé</div>
            <div class="payment-amount">{{ number_format($paiementAcompte->montant, 0, ',', ' ') }} FCFA</div>
            <table class="kv-table">
                <tr>
                    <td class="k">Mode :</td>
                    <td class="v">{{ ucfirst(str_replace('_', ' ', $paiementAcompte->mode_paiement)) }}</td>
                </tr>
                <tr>
                    <td class="k">Date :</td>
                    <td class="v">{{ \Carbon\Carbon::parse($paiementAcompte->date_paiement)->format('d/m/Y à H:i') }}</td>
                </tr>
                @if($paiementAcompte->reference_transaction)
                <tr>
                    <td class="k">Référence :</td>
                    <td class="v">{{ $paiementAcompte->reference_transaction }}</td>
                </tr>
                @endif
                @if($paiementAcompte->user)
                <tr>
                    <td class="k">Encaissé par :</td>
                    <td class="v">{{ $paiementAcompte->user->prenom }} {{ $paiementAcompte->user->nom }}</td>
                </tr>
                @endif
            </table>
        </div>

        <div class="sep-single"></div>

        {{-- Détails financiers --}}
        <div class="section-label">Détails financiers</div>
        <table class="info-table" style="margin-top:1px;">
            @if($rendezVous->prix_estime)
            <tr>
                <td class="lbl">Prix estimé</td>
                <td class="val">{{ number_format($rendezVous->prix_estime, 0, ',', ' ') }} FCFA</td>
            </tr>
            @elseif($rendezVous->prestations && $rendezVous->prestations->count() > 0)
            <tr>
                <td class="lbl">Prix de base</td>
                <td class="val">{{ number_format($rendezVous->prestations->sum('prix_base'), 0, ',', ' ') }} FCFA</td>
            </tr>
            @elseif($rendezVous->typePrestation)
            <tr>
                <td class="lbl">Prix de base</td>
                <td class="val">{{ number_format($rendezVous->typePrestation->prix_base, 0, ',', ' ') }} FCFA</td>
            </tr>
            @endif
            <tr>
                <td class="lbl">Acompte versé</td>
                <td class="val" style="color:#388e3c;">{{ number_format($paiementAcompte->montant, 0, ',', ' ') }} FCFA</td>
            </tr>
            @if($rendezVous->prix_estime)
            <tr>
                <td class="lbl">Solde restant</td>
                <td class="val" style="color:#cc0000;">{{ number_format($rendezVous->prix_estime - $paiementAcompte->montant, 0, ',', ' ') }} FCFA</td>
            </tr>
            @endif
        </table>

    @else
        <div class="alert-box">
            <p class="alert-text">⚠ Aucun paiement d'acompte trouvé</p>
        </div>
    @endif

    {{-- ── RAPPEL ── --}}
    <div class="sep-dashed"></div>
    <div class="alert-box">
        <p class="alert-text">⚠ Le solde restant sera à régler après la prestation</p>
        <p class="alert-text" style="margin-top:2px;">Merci de présenter ce reçu lors de votre rendez-vous</p>
    </div>

    {{-- ── NOTE ── --}}
    @if($rendezVous->notes)
        <div class="sep-dashed"></div>
        <div style="font-size:7px; color:#555; font-style:italic; line-height:1.4;">{{ $rendezVous->notes }}</div>
    @endif

    {{-- ── FOOTER ── --}}
    <div class="sep-double"></div>
    <div class="footer">
        <div class="merci">À bientôt !</div>
        <div class="small-gray" style="margin-top:2px;">Imprimé le {{ now()->format('d/m/Y à H:i') }}</div>
    </div>

</td></tr>
</table>

</body>
</html>
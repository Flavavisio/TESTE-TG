
        window.addEventListener('load', function () {
            var scripts = [
                'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
                'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js',
                'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
            ];
            var folhaLeaflet = document.createElement('link');
            folhaLeaflet.rel = 'stylesheet';
            folhaLeaflet.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
            document.head.appendChild(folhaLeaflet);
            scripts.forEach(function (src) {
                var s = document.createElement('script');
                s.src = src;
                // IMPORTANTE: scripts criados assim executam por defeito em modo "async" — cada
                // um corre assim que acaba de descarregar, não pela ordem da lista. Isso é um
                // problema aqui porque o jspdf-autotable PRECISA que o jsPDF já esteja pronto
                // antes de se anexar a ele; se calhasse de descarregar primeiro, ficava sem
                // efeito nenhum (e daí o erro "Componente de tabelas do PDF não carregado",
                // de forma imprevisível). "async = false" mantém o download em paralelo, mas
                // força a EXECUÇÃO a respeitar a ordem em que os scripts foram pedidos.
                s.async = false;
                document.body.appendChild(s);
            });
        });
    
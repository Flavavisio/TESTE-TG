
        // Configuração EmailJS
        async function _enviarEmailServidor(tipo, params) {
            try {
                const { data, error } = await supa.functions.invoke('super-function', { body: { tipo, ...params } });
                if (error) { console.warn('Falha ao enviar email (' + tipo + '):', error.message || error); return { ok: false, erro: error.message }; }
                if (data && data.erro) { console.warn('Falha ao enviar email (' + tipo + '):', data.erro); return { ok: false, erro: data.erro }; }
                return { ok: true };
            } catch (e) { console.warn('Falha ao enviar email (' + tipo + '):', e); return { ok: false, erro: String(e) }; }
        }
        // Avisa o Super Admin por email sempre que um pedido de renovação/alteração/addon novo é
        // criado (de qualquer um dos vários sítios que criam pedidos) — antes só era avisado
        // dentro da própria app, o que significa que só via o pedido se lá entrasse a olhar.
        function _avisarSuperAdminNovoPedido(pedido, admin) {
            if (!pedido) return;
            _enviarEmailServidor('pedido_renovacao_novo', {
                pedidoId: pedido.id,
                adminId: admin?.id || pedido.adminId,
                adminNome: admin?.nome || '',
                empresa: admin?.empresa || admin?.nome || '',
                tipoPedido: pedido.tipo,
                observacao: pedido.observacao || ''
            }).catch(() => {});
        }
    
import express from 'express';
import { pool } from './db.js';
import { registrarLog } from './audit.js';

const router = express.Router();

// CRUD de Eventos
router.get('/api/eventos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM eventos ORDER BY data DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar eventos', details: error.message });
  }
});

router.post('/api/eventos', async (req, res) => {
  const { nome, data, usuario_id, usuario_nome } = req.body;
  if (!nome || !data) {
    return res.status(400).json({ error: 'Nome e data são obrigatórios.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO eventos (nome, data) VALUES (?, ?)',
      [nome, data]
    );
    
    // Log de auditoria
    try {
      await registrarLog({
        usuario_id: usuario_id || 0,
        usuario_nome: usuario_nome || 'Desconhecido',
        acao: 'CREATE',
        entidade: 'evento',
        entidade_id: result.insertId,
        detalhes: { nome, data }
      });
    } catch (logErr) {
      console.error('Erro ao registrar log (CREATE EVENTO):', logErr);
    }
    
    res.status(201).json({ id: result.insertId, nome, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar evento', details: error.message });
  }
});

// CRUD de Custos de Eventos
router.get('/api/eventos/:eventoId/custos', async (req, res) => {
  try {
    const { eventoId } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM custos_eventos WHERE evento_id = ? ORDER BY criado_em DESC',
      [eventoId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar custos', details: error.message });
  }
});

router.post('/api/eventos/:eventoId/custos', async (req, res) => {
  const { eventoId } = req.params;
  const { descricao, valor, categoria, usuario_id, usuario_nome } = req.body;
  if (!descricao || !valor || !categoria) {
    return res.status(400).json({ error: 'Descrição, valor e categoria são obrigatórios.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO custos_eventos (evento_id, descricao, valor, categoria) VALUES (?, ?, ?, ?)',
      [eventoId, descricao, valor, categoria]
    );
    
    // Log de auditoria
    try {
      await registrarLog({
        usuario_id: usuario_id || 0,
        usuario_nome: usuario_nome || 'Desconhecido',
        acao: 'CREATE',
        entidade: 'custo_evento',
        entidade_id: result.insertId,
        detalhes: { evento_id: eventoId, descricao, valor, categoria }
      });
    } catch (logErr) {
      console.error('Erro ao registrar log (CREATE CUSTO EVENTO):', logErr);
    }
    
    res.status(201).json({ id: result.insertId, evento_id: eventoId, descricao, valor, categoria });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar custo', details: error.message });
  }
});

router.delete('/api/eventos/:eventoId/custos/:custoId', async (req, res) => {
  try {
    const { eventoId, custoId } = req.params;
    await pool.query('DELETE FROM custos_eventos WHERE id = ? AND evento_id = ?', [custoId, eventoId]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir custo', details: error.message });
  }
});

// CRUD de Receitas de Eventos
router.get('/api/eventos/:eventoId/receitas', async (req, res) => {
  try {
    const { eventoId } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM receitas_eventos WHERE evento_id = ? ORDER BY criado_em DESC',
      [eventoId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar receitas', details: error.message });
  }
});

router.post('/api/eventos/:eventoId/receitas', async (req, res) => {
  const { eventoId } = req.params;
  const { descricao, valor, categoria, usuario_id, usuario_nome } = req.body;
  if (!descricao || !valor || !categoria) {
    return res.status(400).json({ error: 'Descrição, valor e categoria são obrigatórios.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO receitas_eventos (evento_id, descricao, valor, categoria) VALUES (?, ?, ?, ?)',
      [eventoId, descricao, valor, categoria]
    );
    
    // Log de auditoria
    try {
      await registrarLog({
        usuario_id: usuario_id || 0,
        usuario_nome: usuario_nome || 'Desconhecido',
        acao: 'CREATE',
        entidade: 'receita_evento',
        entidade_id: result.insertId,
        detalhes: { evento_id: eventoId, descricao, valor, categoria }
      });
    } catch (logErr) {
      console.error('Erro ao registrar log (CREATE RECEITA EVENTO):', logErr);
    }
    
    res.status(201).json({ id: result.insertId, evento_id: eventoId, descricao, valor, categoria });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar receita', details: error.message });
  }
});

router.delete('/api/eventos/:eventoId/receitas/:receitaId', async (req, res) => {
  try {
    const { eventoId, receitaId } = req.params;
    await pool.query('DELETE FROM receitas_eventos WHERE id = ? AND evento_id = ?', [receitaId, eventoId]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir receita', details: error.message });
  }
});

// Exportar eventos para Excel
router.get('/api/eventos/export', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        e.id,
        e.nome,
        e.data,
        e.criado_em,
        COALESCE(SUM(c.valor), 0) as total_custos,
        COALESCE(SUM(r.valor), 0) as total_receitas,
        COALESCE(SUM(r.valor), 0) - COALESCE(SUM(c.valor), 0) as saldo_final
      FROM eventos e
      LEFT JOIN custos_eventos c ON e.id = c.evento_id
      LEFT JOIN receitas_eventos r ON e.id = r.evento_id
      GROUP BY e.id, e.nome, e.data, e.criado_em
      ORDER BY e.data DESC
    `);
    
    // Aqui você pode implementar a geração do Excel
    // Por enquanto, retornamos JSON
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao exportar eventos', details: error.message });
  }
});

// Exportar evento específico para PDF
router.get('/api/eventos/:eventoId/pdf', async (req, res) => {
  try {
    const { eventoId } = req.params;
    
    // Buscar dados do evento
    const [evento] = await pool.query('SELECT * FROM eventos WHERE id = ?', [eventoId]);
    if (evento.length === 0) {
      return res.status(404).json({ error: 'Evento não encontrado.' });
    }
    
    // Buscar custos
    const [custos] = await pool.query(
      'SELECT * FROM custos_eventos WHERE evento_id = ? ORDER BY categoria, descricao',
      [eventoId]
    );
    
    // Buscar receitas
    const [receitas] = await pool.query(
      'SELECT * FROM receitas_eventos WHERE evento_id = ? ORDER BY categoria, descricao',
      [eventoId]
    );
    
    const totalCustos = custos.reduce((sum, custo) => sum + custo.valor, 0);
    const totalReceitas = receitas.reduce((sum, receita) => sum + receita.valor, 0);
    const saldoFinal = totalReceitas - totalCustos;
    
    // Aqui você pode implementar a geração do PDF
    // Por enquanto, retornamos JSON
    res.json({
      evento: evento[0],
      custos,
      receitas,
      totalCustos,
      totalReceitas,
      saldoFinal
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao gerar PDF', details: error.message });
  }
});

export default router;


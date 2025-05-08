// src/app/pesquisar/page.tsx
'use client'

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';
import { Search, Loader2, ArrowLeft, ArrowRight, Archive, FileText, CornerDownLeft } from 'lucide-react';

interface ProcessoPesquisado {
    id: number;
    numero: string | null;
    tipo: string;
    interessado: string;
    criadoEm: string;
    acesso: string;
    arquivado: boolean;
}

interface PaginationInfo {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

export default function PesquisarProcessosPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [filtros, setFiltros] = useState({
        numero: '',
        tipo: '',
        interessado: '',
        status: 'todos',
    });
    const [resultados, setResultados] = useState<ProcessoPesquisado[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, pageSize: 10, total: 0, totalPages: 1 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchPerformed, setSearchPerformed] = useState(false);

    const fetchData = async (page = 1, currentFilters = filtros) => {
        setLoading(true);
        setError(null);
        // setSearchPerformed(true); // Mover para handleSearchSubmit
        console.log("--- [Pesquisar Page] Buscando com filtros:", currentFilters);
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('pageSize', pagination.pageSize.toString());
            if (currentFilters.numero.trim()) params.append('numero', currentFilters.numero.trim()); // Usar trim
            if (currentFilters.tipo.trim()) params.append('tipo', currentFilters.tipo.trim());       // Usar trim
            if (currentFilters.interessado.trim()) params.append('interessado', currentFilters.interessado.trim()); // Usar trim
            if (currentFilters.status !== 'todos') {
                 params.append('status', currentFilters.status);
            }

            console.log(`--- [Pesquisar Page] Chamando API: /api/processos/pesquisar?${params.toString()} ---`);
            const res = await fetch(`/api/processos/pesquisar?${params.toString()}`);
            console.log(`--- [Pesquisar Page] Resposta API status: ${res.status} ---`);

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: `Erro ${res.status}` }));
                 if (res.status === 403) {
                     throw new Error(errorData.error || "Você não tem permissão para realizar esta pesquisa.");
                 }
                throw new Error(errorData.error || `Erro ao pesquisar processos`);
            }
            const data = await res.json();
            console.log(`--- [Pesquisar Page] Dados recebidos:`, data);
            setResultados(data.data || []);
            setPagination(data.pagination || { page: 1, pageSize: 10, total: 0, totalPages: 1 });
        } catch (err: any) {
            console.error("--- [Pesquisar Page] Erro no fetchData:", err);
            setError(err.message);
            setResultados([]);
            setPagination({ page: 1, pageSize: 10, total: 0, totalPages: 1 });
            toast.error(`Erro ao pesquisar: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
       console.log("--- [Pesquisar Page] Montado. Aguardando busca do usuário.");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- CORREÇÃO AQUI ---
    const handleSearchSubmit = (e: FormEvent) => {
        e.preventDefault();
        console.log("--- [Pesquisar Page] Submit busca ---");

        // Verifica se algum campo de texto foi preenchido ou se o status é diferente de 'todos'
        const hasFilters =
            filtros.numero.trim() !== '' ||
            filtros.tipo.trim() !== '' ||
            filtros.interessado.trim() !== '' ||
            filtros.status !== 'todos';

        setSearchPerformed(true); // Marca que a tentativa de busca ocorreu

        if (!hasFilters) {
            console.log("--- [Pesquisar Page] Nenhum filtro fornecido. Limpando resultados.");
            toast.info("Por favor, informe ao menos um critério de pesquisa.");
            setResultados([]); // Limpa resultados anteriores
            setPagination({ page: 1, pageSize: 10, total: 0, totalPages: 1 }); // Reseta paginação
            setError(null); // Limpa erros anteriores
            setLoading(false); // Garante que não fique em loading
            // Não chama fetchData
        } else {
            // Se há filtros, executa a busca normalmente
            fetchData(1, filtros); // Busca na página 1 com os filtros atuais
        }
    };
    // --- FIM DA CORREÇÃO ---

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFiltros(prev => ({ ...prev, [name]: value }));
    };
    const handleStatusChange = (value: string) => {
         setFiltros(prev => ({ ...prev, status: value }));
    };

    const goToPage = (newPage: number) => {
         if (newPage >= 1 && newPage <= pagination.totalPages && searchPerformed && resultados.length > 0) { // Só pagina se já houve busca com resultados
             fetchData(newPage, filtros);
         }
     };

    return (
        <div className="p-6 space-y-6">
             <div className="flex justify-between items-center flex-wrap gap-2">
                 <h1 className="text-2xl font-semibold">Pesquisar Processos</h1>
                 <Link href="/controle-de-processos">
                     <Button variant="outline" size="sm" className="flex items-center gap-1">
                         <CornerDownLeft className="h-4 w-4"/> Voltar
                     </Button>
                 </Link>
             </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filtros de Pesquisa</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearchSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Input name="numero" placeholder="Número" value={filtros.numero} onChange={handleInputChange}/>
                            <Input name="tipo" placeholder="Tipo" value={filtros.tipo} onChange={handleInputChange}/>
                            <Input name="interessado" placeholder="Interessado" value={filtros.interessado} onChange={handleInputChange}/>
                             <div>
                                 <Label htmlFor="status-select" className="text-xs text-gray-600">Status</Label>
                                 <Select value={filtros.status} onValueChange={handleStatusChange}>
                                     <SelectTrigger id="status-select">
                                         <SelectValue placeholder="Selecione o status" />
                                     </SelectTrigger>
                                     <SelectContent>
                                         <SelectItem value="todos">Todos</SelectItem>
                                         <SelectItem value="ativo">Ativos</SelectItem>
                                         <SelectItem value="arquivado">Arquivados</SelectItem>
                                     </SelectContent>
                                 </Select>
                             </div>
                        </div>
                        <Button type="submit" disabled={loading} className="flex items-center gap-1">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            Pesquisar
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {error && <p className="text-red-600 bg-red-100 p-3 rounded border border-red-300">{error}</p>}

            {/* Tabela de Resultados / Mensagens */}
            <Card>
                 <CardHeader>
                     <CardTitle className="text-lg">Resultados {searchPerformed && resultados.length > 0 ? `(${pagination.total})` : ''}</CardTitle>
                 </CardHeader>
                 <CardContent>
                     {!searchPerformed ? (
                         <div className="text-center p-4 text-gray-500">Utilize os filtros acima e clique em "Pesquisar" para ver os processos.</div>
                     ) : loading ? (
                         <div className="text-center p-4 text-gray-500"><Loader2 className="h-5 w-5 animate-spin inline mr-2"/> Carregando resultados...</div>
                     // --- AJUSTE NA CONDIÇÃO "NENHUM ENCONTRADO" ---
                     ) : resultados.length === 0 && !error ? (
                         <div className="text-center p-4 text-gray-500">
                            {/* Mensagem muda se foi falta de critério ou se não achou mesmo */}
                            {!filtros.numero.trim() && !filtros.tipo.trim() && !filtros.interessado.trim() && filtros.status === 'todos'
                                ? "Por favor, informe ao menos um critério para pesquisa."
                                : "Nenhum processo encontrado com os filtros aplicados."}
                         </div>
                     // --- FIM DO AJUSTE ---
                     ) : resultados.length > 0 && !error ? (
                         <>
                             <Table>
                                {/* ... Table Header e Table Body como antes ... */}
                                <TableHeader><TableRow><TableHead>Número</TableHead><TableHead>Tipo</TableHead><TableHead>Interessado</TableHead><TableHead>Acesso</TableHead><TableHead>Status</TableHead><TableHead>Criado Em</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {resultados.map((proc) => (
                                        <TableRow key={proc.id}>
                                            <TableCell><Link href={`/controle-de-processos/${proc.id}`} className="text-blue-600 hover:underline font-medium">{proc.numero || 'N/A'}</Link></TableCell>
                                            <TableCell>{proc.tipo}</TableCell>
                                            <TableCell>{proc.interessado}</TableCell>
                                            <TableCell>{proc.acesso}</TableCell>
                                            <TableCell>{proc.arquivado ? <span className="flex items-center text-xs text-gray-500"><Archive className="h-3 w-3 mr-1"/> Arquivado</span> : <span className="flex items-center text-xs text-green-600"><FileText className="h-3 w-3 mr-1"/> Ativo</span>}</TableCell>
                                            <TableCell>{new Date(proc.criadoEm).toLocaleDateString('pt-BR')}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                             </Table>
                            {pagination.totalPages > 1 && (
                                 <div className="flex justify-between items-center mt-4 text-sm">
                                     <span>Página {pagination.page} de {pagination.totalPages}</span>
                                     <div className="flex gap-2">
                                         <Button variant="outline" size="sm" onClick={() => goToPage(pagination.page - 1)} disabled={pagination.page <= 1 || loading}><ArrowLeft className="h-4 w-4 mr-1"/> Anterior</Button>
                                         <Button variant="outline" size="sm" onClick={() => goToPage(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages || loading}>Próxima <ArrowRight className="h-4 w-4 ml-1"/></Button>
                                     </div>
                                 </div>
                             )}
                         </>
                     ) : null
                     }
                 </CardContent>
            </Card>
        </div>
    );
}
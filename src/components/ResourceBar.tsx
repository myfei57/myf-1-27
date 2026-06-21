import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Coins, Package, History, Filter, ChevronDown } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { Modal } from './Modal';
import type { ResourceType, SourcePage } from '../types';
import { formatDate } from '../utils/helpers';

const sourcePageLabels: Record<SourcePage, string> = {
  'blind-box': '盲盒开盒',
  missions: '任务派遣',
  repair: '维修中心',
  inventory: '零件仓库',
};

const sourcePageColors: Record<SourcePage, string> = {
  'blind-box': 'text-neon-purple',
  missions: 'text-neon-blue',
  repair: 'text-neon-green',
  inventory: 'text-neon-orange',
};

export function ResourceBar() {
  const credits = useGameStore((s) => s.credits);
  const materials = useGameStore((s) => s.materials);
  const resourceTransactions = useGameStore((s) => s.resourceTransactions);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [filterResource, setFilterResource] = useState<ResourceType | 'all'>('all');
  const [filterSourcePage, setFilterSourcePage] = useState<SourcePage | 'all'>('all');

  const filteredTransactions = useMemo(() => {
    return resourceTransactions.filter((t) => {
      if (filterResource !== 'all' && t.resourceType !== filterResource) return false;
      if (filterSourcePage !== 'all' && t.sourcePage !== filterSourcePage) return false;
      return true;
    });
  }, [resourceTransactions, filterResource, filterSourcePage]);

  return (
    <>
      <div className="flex items-center gap-4 cursor-pointer" onClick={() => setIsPanelOpen(true)}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 px-4 py-2 bg-background-secondary rounded-lg border border-neon-orange/30 hover:border-neon-orange/60 transition-colors"
        >
          <Coins className="w-5 h-5 text-neon-orange" />
          <span className="font-mono font-bold text-neon-orange">{credits}</span>
          <span className="text-xs text-white/50">信用点</span>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 px-4 py-2 bg-background-secondary rounded-lg border border-neon-green/30 hover:border-neon-green/60 transition-colors"
        >
          <Package className="w-5 h-5 text-neon-green" />
          <span className="font-mono font-bold text-neon-green">{materials}</span>
          <span className="text-xs text-white/50">材料</span>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-1 px-3 py-2 bg-background-secondary rounded-lg border border-neon-blue/30 hover:border-neon-blue/60 transition-colors"
        >
          <History className="w-5 h-5 text-neon-blue" />
          <ChevronDown className="w-4 h-4 text-neon-blue" />
        </motion.div>
      </div>

      <Modal
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        title="资源流水"
        size="xl"
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center p-4 bg-background-tertiary rounded-xl">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-white/50" />
              <span className="text-sm text-white/70">筛选:</span>
            </div>

            <select
              value={filterResource}
              onChange={(e) => setFilterResource(e.target.value as ResourceType | 'all')}
              className="input max-w-[160px] text-sm"
            >
              <option value="all">全部资源</option>
              <option value="credits">信用点</option>
              <option value="materials">材料</option>
            </select>

            <select
              value={filterSourcePage}
              onChange={(e) => setFilterSourcePage(e.target.value as SourcePage | 'all')}
              className="input max-w-[160px] text-sm"
            >
              <option value="all">全部来源</option>
              {Object.entries(sourcePageLabels).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>

            <div className="ml-auto text-xs text-white/50">
              共 {filteredTransactions.length} 条记录
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto pr-2 scrollbar-thin space-y-3">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-white/30">
                <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无流水记录</p>
                <p className="text-xs mt-1">完成操作后流水会自动记录在此</p>
              </div>
            ) : (
              filteredTransactions.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-background-tertiary rounded-xl border border-border-subtle"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {t.resourceType === 'credits' ? (
                          <div className="w-8 h-8 rounded-lg bg-neon-orange/20 flex items-center justify-center">
                            <Coins className="w-4 h-4 text-neon-orange" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-neon-green/20 flex items-center justify-center">
                            <Package className="w-4 h-4 text-neon-green" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white">{t.action}</span>
                            <span className={`text-xs ${sourcePageColors[t.sourcePage]}`}>
                              · {sourcePageLabels[t.sourcePage]}
                            </span>
                          </div>
                          <div className="text-xs text-white/40 mt-0.5">
                            {formatDate(t.timestamp)}
                          </div>
                        </div>
                      </div>

                      {(t.relatedRobotName || t.relatedPartName) && (
                        <div className="ml-11 mb-2 flex flex-wrap gap-2">
                          {t.relatedRobotName && (
                            <span className="text-xs px-2 py-1 rounded bg-neon-blue/10 text-neon-blue border border-neon-blue/20">
                              机器人: {t.relatedRobotName}
                            </span>
                          )}
                          {t.relatedPartName && (
                            <span className="text-xs px-2 py-1 rounded bg-neon-purple/10 text-neon-purple border border-neon-purple/20">
                              零件: {t.relatedPartName}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="ml-11 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-white/50">变更前:</span>
                          <span className={`font-mono font-bold ${t.resourceType === 'credits' ? 'text-neon-orange' : 'text-neon-green'}`}>
                            {t.beforeValue}
                          </span>
                        </div>
                        <div className="text-white/30">→</div>
                        <div className="flex items-center gap-1">
                          <span className="text-white/50">变更后:</span>
                          <span className={`font-mono font-bold ${t.resourceType === 'credits' ? 'text-neon-orange' : 'text-neon-green'}`}>
                            {t.afterValue}
                          </span>
                        </div>
                        <div className="ml-auto">
                          <span
                            className={`font-mono font-bold text-lg ${
                              t.amount > 0 ? 'text-neon-green' : 'text-neon-red'
                            }`}
                          >
                            {t.amount > 0 ? '+' : ''}{t.amount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}

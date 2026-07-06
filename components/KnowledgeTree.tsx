'use client';

import { useState, useCallback } from 'react';
import { KnowledgeNode } from '@/types';
import { ChevronRight, Folder, FolderOpen, FileText } from 'lucide-react';

interface TreeNodeProps {
  node: KnowledgeNode;
  allNodes: KnowledgeNode[];
  depth: number;
  selectedId?: string;
  onSelect?: (node: KnowledgeNode) => void;
}

function TreeNode({ node, allNodes, depth, selectedId, onSelect }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(depth < 2);
  const children = allNodes.filter((n) => n.parentId === node.id);
  const hasChildren = children.length > 0;
  const isSelected = selectedId === node.id;

  const toggle = useCallback(() => {
    if (hasChildren) {
      setExpanded((e) => !e);
    }
  }, [hasChildren]);

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 py-1.5 px-2 rounded-lg cursor-pointer transition-colors ${
          isSelected
            ? 'bg-primary/20 text-primary-light'
            : 'hover:bg-surface-light text-text-secondary hover:text-text-primary'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
          toggle();
          onSelect?.(node);
        }}
      >
        {hasChildren ? (
          <ChevronRight
            className={`w-3.5 h-3.5 transition-transform ${
              expanded ? 'rotate-90' : ''
            }`}
          />
        ) : (
          <span className="w-3.5" />
        )}
        {hasChildren ? (
          expanded ? (
            <FolderOpen className="w-4 h-4 text-primary-light" />
          ) : (
            <Folder className="w-4 h-4 text-primary-light" />
          )
        ) : (
          <FileText className="w-4 h-4 text-text-muted" />
        )}
        <span className="text-sm truncate">{node.title}</span>
        {hasChildren && (
          <span className="text-xs text-text-muted ml-auto">
            {children.length}
          </span>
        )}
      </div>
      {expanded && hasChildren && (
        <div>
          {children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              allNodes={allNodes}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface KnowledgeTreeProps {
  nodes: KnowledgeNode[];
  selectedId?: string;
  onSelect?: (node: KnowledgeNode) => void;
  className?: string;
}

export default function KnowledgeTree({
  nodes,
  selectedId,
  onSelect,
  className = '',
}: KnowledgeTreeProps) {
  const rootNodes = nodes.filter(
    (n) => !n.parentId || !nodes.some((p) => p.id === n.parentId)
  );

  return (
    <div className={`overflow-auto ${className}`}>
      {rootNodes.length === 0 ? (
        <div className="text-center py-8 text-text-muted text-sm">
          暂无知识节点
        </div>
      ) : (
        rootNodes.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            allNodes={nodes}
            depth={0}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))
      )}
    </div>
  );
}
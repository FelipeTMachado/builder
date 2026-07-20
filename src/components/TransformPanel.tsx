import React, { useState } from 'react';
import { useMeshStore } from '../store/useMeshStore';

export function TransformPanel() {
  const { 
    objects, 
    selectedId, 
    transformMode, 
    updateTransformData, 
    globalUnit, 
    setGlobalUnit,
    isScaleLocked
  } = useMeshStore();

  const [editState, setEditState] = useState<{ axis: 'x'|'y'|'z', val: string } | null>(null);

  const selectedObj = objects.find(o => o.id === selectedId);

  // Se não houver objeto selecionado, ou o modo de transformação não for um dos três, não exibe o painel
  if (!selectedObj || !transformMode || transformMode === 'measure') return null;

  const unitMultiplier = globalUnit === 'cm' ? 0.1 : 1;
  const inverseMultiplier = globalUnit === 'cm' ? 10 : 1;

  // Extração dos valores baseados no modo ativo
  let valX = 0, valY = 0, valZ = 0;
  let label = '';

  if (transformMode === 'translate') {
    label = 'Posição';
    valX = selectedObj.transformData.position[0] * unitMultiplier;
    valY = selectedObj.transformData.position[1] * unitMultiplier;
    valZ = selectedObj.transformData.position[2] * unitMultiplier;
  } else if (transformMode === 'rotate') {
    label = 'Rotação (graus)';
    valX = selectedObj.transformData.rotation[0] * (180 / Math.PI);
    valY = selectedObj.transformData.rotation[1] * (180 / Math.PI);
    valZ = selectedObj.transformData.rotation[2] * (180 / Math.PI);
  } else if (transformMode === 'scale') {
    label = 'Dimensões';
    valX = selectedObj.baseSize[0] * selectedObj.transformData.scale[0] * unitMultiplier;
    valY = selectedObj.baseSize[1] * selectedObj.transformData.scale[1] * unitMultiplier;
    valZ = selectedObj.baseSize[2] * selectedObj.transformData.scale[2] * unitMultiplier;
  }

  // Valores de display (se estiver editando, mostra o digitado; senão, mostra o valor real arredondado)
  const displayX = editState?.axis === 'x' ? editState.val : Number(valX.toFixed(2)).toString();
  const displayY = editState?.axis === 'y' ? editState.val : (Number(valX.toFixed(2)) === 0 && Number(valY.toFixed(2)) === 0 ? "0" : Number(valY.toFixed(2)).toString());
  const displayZ = editState?.axis === 'z' ? editState.val : Number(valZ.toFixed(2)).toString();

  // Tratador genérico de mudança nos inputs
  const handleChange = (axis: 'x' | 'y' | 'z', valueStr: string) => {
    if (valueStr === '') return;
    const num = parseFloat(valueStr);
    if (isNaN(num)) return;

    if (transformMode === 'translate') {
      const realPos = num * inverseMultiplier;
      const newPos = [...selectedObj.transformData.position] as [number, number, number];
      if (axis === 'x') newPos[0] = realPos;
      if (axis === 'y') newPos[1] = realPos;
      if (axis === 'z') newPos[2] = realPos;
      updateTransformData(selectedObj.id, { position: newPos });
    } 
    else if (transformMode === 'rotate') {
      const realRot = num * (Math.PI / 180);
      const newRot = [...selectedObj.transformData.rotation] as [number, number, number];
      if (axis === 'x') newRot[0] = realRot;
      if (axis === 'y') newRot[1] = realRot;
      if (axis === 'z') newRot[2] = realRot;
      updateTransformData(selectedObj.id, { rotation: newRot });
    } 
    else if (transformMode === 'scale') {
      // Impede tamanhos negativos ou exatamente 0 para evitar inversão de normais ou sumiços
      if (num <= 0.01) {
         num = 0.1;
      }
      
      const realDim = num * inverseMultiplier;
      
      const idx = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
      
      // Protege contra divisão por zero (não deveria acontecer em malhas saudáveis)
      if (selectedObj.baseSize[idx] === 0) return;
      
      const newScaleVal = realDim / selectedObj.baseSize[idx];
      const oldScaleVal = selectedObj.transformData.scale[idx];
      
      const newScale = [...selectedObj.transformData.scale] as [number, number, number];
      newScale[idx] = newScaleVal;

      // Aplicando bloqueio proporcional (Cadeado do 3D Builder)
      if (isScaleLocked && oldScaleVal !== 0) {
         const ratio = newScaleVal / oldScaleVal;
         if (axis !== 'x') newScale[0] = selectedObj.transformData.scale[0] * ratio;
         if (axis !== 'y') newScale[1] = selectedObj.transformData.scale[1] * ratio;
         if (axis !== 'z') newScale[2] = selectedObj.transformData.scale[2] * ratio;
      }
      
      updateTransformData(selectedObj.id, { scale: newScale });
    }
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: '32px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(30, 41, 59, 0.85)',
      backdropFilter: 'blur(16px)',
      border: '1px solid #334155',
      borderRadius: '12px',
      padding: '8px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      zIndex: 10,
      width: 'max-content'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '6px' }}>
        <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }}>{label}</span>
        
        {transformMode !== 'rotate' && (
          <select 
            value={globalUnit} 
            onChange={e => setGlobalUnit(e.target.value as 'mm' | 'cm')}
            style={{ 
              background: '#0f172a', 
              color: '#94a3b8', 
              border: '1px solid #334155', 
              borderRadius: '6px', 
              padding: '2px 6px',
              fontSize: '11px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="mm">Milímetros (mm)</option>
            <option value="cm">Centímetros (cm)</option>
          </select>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        {/* Eixo X */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ color: '#ef4444', fontSize: '12px', fontWeight: 'bold' }}>X</label>
          <input 
            type="number" 
            step="0.1" 
            value={displayX} 
            onChange={(e) => setEditState({ axis: 'x', val: e.target.value })}
            onFocus={() => setEditState({ axis: 'x', val: Number(valX.toFixed(2)).toString() })}
            onBlur={() => {
              if (editState?.axis === 'x') {
                handleChange('x', editState.val);
                setEditState(null);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
            }}
            style={{
              background: '#0f172a',
              border: '1px solid #334155',
              color: 'white',
              borderRadius: '4px',
              padding: '4px 6px',
              width: '60px',
              fontSize: '12px',
              outline: 'none',
              textAlign: 'center'
            }}
          />
        </div>

        {/* Eixo Y */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ color: '#22c55e', fontSize: '12px', fontWeight: 'bold' }}>Y</label>
          <input 
            type="number" 
            step="0.1" 
            value={displayY} 
            onChange={(e) => setEditState({ axis: 'y', val: e.target.value })}
            onFocus={() => setEditState({ axis: 'y', val: (Number(valX.toFixed(2)) === 0 && Number(valY.toFixed(2)) === 0 ? 0 : Number(valY.toFixed(2))).toString() })}
            onBlur={() => {
              if (editState?.axis === 'y') {
                handleChange('y', editState.val);
                setEditState(null);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
            }}
            style={{
              background: '#0f172a',
              border: '1px solid #334155',
              color: 'white',
              borderRadius: '4px',
              padding: '4px 6px',
              width: '60px',
              fontSize: '12px',
              outline: 'none',
              textAlign: 'center'
            }}
          />
        </div>

        {/* Eixo Z */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ color: '#3b82f6', fontSize: '12px', fontWeight: 'bold' }}>Z</label>
          <input 
            type="number" 
            step="0.1" 
            value={displayZ} 
            onChange={(e) => setEditState({ axis: 'z', val: e.target.value })}
            onFocus={() => setEditState({ axis: 'z', val: Number(valZ.toFixed(2)).toString() })}
            onBlur={() => {
              if (editState?.axis === 'z') {
                handleChange('z', editState.val);
                setEditState(null);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
            }}
            style={{
              background: '#0f172a',
              border: '1px solid #334155',
              color: 'white',
              borderRadius: '4px',
              padding: '4px 6px',
              width: '60px',
              fontSize: '12px',
              outline: 'none',
              textAlign: 'center'
            }}
          />
        </div>
      </div>
    </div>
  );
}

# pitch-echo

实时音高识别显示系统

Real-time Pitch Detection and Display System

## Getting Started

```bash
git clone https://github.com/GoddoNebianU/pitch-echo.git
cd pitch-echo
pnpm i
pnpm dev
```

## 技术细节

- 使用pitchy库实时识别从麦克风获取的音频的频率
- 带通滤波滤去设定的频率范围之外的音高
- 使用指数衰减加权移动平均滤波器，使频谱图趋于平滑
- 用canvas绘制频谱图

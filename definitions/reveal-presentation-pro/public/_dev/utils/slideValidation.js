import { z } from 'zod';

const allowedElementTypes = [
    'div', 'section', 'article', 'aside', 'header', 'footer',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'strong', 'em', 'ul', 'ol', 'li',
    'button', 'a', 'img', 'code', 'pre', 'blockquote', 'svg',
    // Recharts
    'BarChart', 'LineChart', 'AreaChart', 'PieChart', 'RadarChart', 'ResponsiveContainer',
    'XAxis', 'YAxis', 'CartesianGrid', 'Tooltip', 'Legend', 'Bar', 'Line', 'Area', 'Pie', 'Radar',
    'PolarGrid', 'PolarAngleAxis', 'PolarRadiusAxis', 'Cell',
    // Slide Templates
    'StatCard', 'GlassCard', 'IconBadge', 'Timeline', 'Comparison', 'CodeBlock'
];

const styleKeys = [
    'position', 'left', 'top', 'right', 'bottom', 'zIndex',
    'width', 'height', 'maxWidth', 'maxHeight', 'minWidth', 'minHeight',
    'color', 'background', 'backgroundColor', 'backgroundImage', 'borderRadius',
    'boxShadow', 'padding', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom',
    'margin', 'marginLeft', 'marginRight', 'marginTop', 'marginBottom',
    'transform', 'opacity', 'backdropFilter'
];

const StyleSchema = z.record(z.string(), z.any()).refine((obj) => {
    return Object.keys(obj).every((k) => styleKeys.includes(k));
}, { message: 'Invalid style key' });

const SVGElementSchema = z.object({
    type: z.literal('svg'),
    id: z.string().optional(),
    icon: z.string(),
    size: z.number().optional(),
    className: z.string().optional(),
    props: z.record(z.string(), z.any()).optional(),
    _streaming: z.boolean().optional(),
});

const SlideElementSchema = z.lazy(() => z.union([
    SVGElementSchema,
    z.object({
        type: z.string().refine((t) => allowedElementTypes.includes(t) && t !== 'svg', { message: 'Invalid element type' }),
        id: z.string().optional(),
        className: z.string().optional(),
        text: z.string().optional(),
        props: z.record(z.string(), z.any()).optional(),
        children: z.array(SlideElementSchema).optional(),
        style: StyleSchema.optional(),
        role: z.string().optional(),
        ariaLevel: z.string().optional(),
        'data-fragment-index': z.number().optional(),
        'data-transition': z.string().optional(),
        _streaming: z.boolean().optional(),
    })
]));

const CanvasSchema = z.object({ width: z.number().optional(), height: z.number().optional() }).partial();

const BackgroundSchema = z.object({
    type: z.enum(['mesh', 'particles', 'mesh-particles', 'gradient', 'solid']),
    colors: z.array(z.string()).optional(),
    color: z.string().optional(),
    animation: z.enum(['none', 'slow', 'medium', 'fast']).optional(),
    count: z.number().optional(),
    speed: z.enum(['none', 'slow', 'medium', 'fast']).optional(),
}).optional();

export const SlideSchema = z.object({
    id: z.string(),
    canvas: CanvasSchema.default({ width: 1920, height: 1080 }),
    root: SlideElementSchema,
    metadata: z.object({
        title: z.string().optional(),
        notes: z.string().optional(),
        background: BackgroundSchema,
    }).optional(),
});

export const slideValidator = (data) => {
    const result = SlideSchema.safeParse(data);
    if (!result.success) {
        throw result.error;
    }
    return result.data;
};

export const sanitizeSlideTree = (slide) => {
    const sanitizeNode = (node) => {
        if (!node) return null;
        const clean = { type: node.type };
        if (node.className) clean.className = node.className;
        if (node.id) clean.id = node.id;
        if (node.text) clean.text = node.text;
        if (node.props) clean.props = node.props;
        if (node.icon) clean.icon = node.icon;
        if (node.size !== undefined) clean.size = node.size;
        if (node.role) clean.role = node.role;
        if (node.ariaLevel) clean.ariaLevel = node.ariaLevel;
        if (node['data-fragment-index'] !== undefined) clean['data-fragment-index'] = node['data-fragment-index'];
        if (node['data-transition']) clean['data-transition'] = node['data-transition'];
        if (node.style) {
            clean.style = Object.fromEntries(
                Object.entries(node.style).filter(([k]) => styleKeys.includes(k))
            );
        }
        if (node.children && Array.isArray(node.children)) {
            clean.children = node.children.map(sanitizeNode).filter(Boolean);
        }
        if (node._streaming) clean._streaming = true;
        return clean;
    };

    const sanitized = {
        ...slide,
        root: sanitizeNode(slide.root),
    };

    if (slide.metadata) {
        sanitized.metadata = {
            ...slide.metadata,
            background: slide.metadata.background || undefined
        };
    }

    return sanitized;
};

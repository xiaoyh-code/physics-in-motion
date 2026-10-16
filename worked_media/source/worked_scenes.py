"""Original worked solutions. Manim CE + Typst vector mathematics.
Run from any directory: manim -qm --fps 24 --media_dir <output> worked_scenes.py MotionSolution DisplacementSolution VectorSolution NewtonSolution
"""
from manim import *
from pathlib import Path
import hashlib,json,subprocess,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parent
B='#1757BD'; R='#BD2947'; INK='#12315B'; MUTED='#526783'; GRID='#C9D8ED'; PALE='#EAF2FF'
config.background_color=WHITE

def T(s,size=25,color=INK):return Text(s,font='Arial',font_size=size,color=color)
def E(s,width=4.7,color=INK):
    key=hashlib.sha256(('transparent-v2:'+s).encode()).hexdigest()[:16];base=ROOT/'math'/key;base.parent.mkdir(exist_ok=True)
    if not base.with_suffix('.svg').exists():
        base.with_suffix('.typ').write_text('#set page(width: auto, height: auto, margin: 2pt, fill: none)\n#set text(size: 24pt)\n$ '+s+' $\n')
        subprocess.run(['typst','compile','--format','svg',str(base.with_suffix('.typ')),str(base.with_suffix('.svg'))],check=True,capture_output=True)
    m=SVGMobject(str(base.with_suffix('.svg'))).set_color(color)
    natural_height=float(ET.parse(base.with_suffix('.svg')).getroot().get('viewBox').split()[3])
    m.scale_to_fit_height(natural_height*.017)
    if m.width>width:m.scale_to_fit_width(width)
    return m
class Worked(Scene):
    topic='';title=''
    def setup(self):
        self.marks=[];self.panel=VGroup();self.header=T('',20);self.caption=T('',20)
        self.add(T('PHYSICS IN MOTION  /  VISUAL WORKED SOLUTION',16,B).to_corner(UL,buff=.35),T(self.title,32).scale_to_fit_width(min(12.5,T(self.title,32).width)).move_to([0,3.04,0]))
        self.add(Line([.1,2.1,0],[.1,-2.9,0],color=GRID))
    def stage(self,title,caption):
        self.marks.append({'time':round(self.renderer.time,3),'title':title})
        self.remove(self.header,self.caption)
        self.header=T(f'{len(self.marks):02d}  {title}',22,B).move_to([0,2.45,0]);self.caption=T(caption,19,MUTED).move_to([0,-3.48,0]);self.caption.scale_to_fit_width(min(13,self.caption.width));self.add(self.header,self.caption)
    def panel_lines(self,*items):
        self.play(FadeOut(self.panel),run_time=.25) if len(self.panel) else None
        self.panel=VGroup(*items).arrange(DOWN,buff=.55).move_to([3.5,-.1,0]);self.play(FadeIn(self.panel,shift=UP*.1),run_time=.5)
    def axes(self,xrange,yrange):
        ax=Axes(x_range=xrange,y_range=yrange,x_length=5.2,y_length=3.2,axis_config={'include_tip':False,'color':GRID}).move_to([-3.25,.0,0]);self.add(ax)
        for v in range(int(xrange[0]),int(xrange[1])+1,int(xrange[2])):self.add(T(str(v),15,MUTED).move_to(ax.c2p(v,0)+DOWN*.26))
        for v in range(int(yrange[0]),int(yrange[1])+1,int(yrange[2])):
            if v:self.add(T(str(v),15,MUTED).move_to(ax.c2p(0,v)+LEFT*.28))
        return ax
    def tear_down(self):
        self.marks.append({'time':round(self.renderer.time,3),'title':'End'})
        (ROOT/f'{self.topic}_chapters.json').write_text(json.dumps(self.marks,indent=2))
class MotionSolution(Worked):
    """A visual proof: one physical clock drives the trolley and its v–t graph.

    Cyan always means initial velocity; amber always means velocity gained.
    The other worked scenes deliberately retain their established appearance.
    """
    topic = 'motion'
    title = 'How a graph measures a journey'
    NIGHT = '#111722'
    LIGHT = '#F1F4FA'
    SOFT = '#ADB9CB'
    AXIS = '#74849C'
    CYAN = '#57C9E8'
    AMBER = '#F5C66D'

    def setup(self):
        self.camera.background_color = self.NIGHT
        self.marks = []
        self.panel = VGroup()
        self.header = VGroup()
        self.caption = VGroup()
        self.add(T('01  /  VELOCITY & TIME', 16, self.CYAN).to_corner(UL, buff=.35))
        self.add(T('EDEXCEL INTERNATIONAL A LEVEL', 14, self.SOFT).to_corner(UR, buff=.35))
        self.add(T(self.title, 32, self.LIGHT).move_to([0, 3.02, 0]))

    def stage(self, title, caption):
        self.marks.append({'time': round(self.renderer.time, 3), 'title': title})
        self.remove(self.header, self.caption)
        self.header = T(f'{len(self.marks):02d}   {title}', 21, self.LIGHT).move_to([0, 2.43, 0])
        self.caption = T(caption, 18, self.SOFT).move_to([0, -3.56, 0])
        if self.caption.width > 13:
            self.caption.scale_to_fit_width(13)
        self.add(self.header, self.caption)

    def formula(self, *items):
        if len(self.panel):
            self.play(FadeOut(self.panel, shift=UP*.08), run_time=.4)
        self.panel = VGroup(*items).arrange(DOWN, buff=.42).move_to([3.15, .24, 0])
        self.play(FadeIn(self.panel, shift=UP*.08), run_time=.6)
        return self.panel

    def math(self, expression, color=None, width=5.25):
        return E(expression, width=width, color=color or self.LIGHT)

    def construct(self):
        self.stage('One journey, two views', 'The trolley and graph share one clock. Playback is slowed; t shows physical time.')
        # The plot has meaningful units; the track below has an independent position scale.
        ax = Axes(x_range=[0, 4, 1], y_range=[0, 8, 2], x_length=5.0, y_length=3.0,
                  axis_config={'include_tip': False, 'color': self.AXIS, 'stroke_width': 1.8})
        ax.shift(np.array([-5.75, -1.43, 0]) - ax.c2p(0, 0))
        ticks = VGroup(*[T(str(i), 15, self.SOFT).move_to(ax.c2p(i, 0)+DOWN*.24) for i in range(5)],
                       *[T(str(i), 15, self.SOFT).move_to(ax.c2p(0, i)+LEFT*.27) for i in (2, 4, 6, 8)])
        axis_labels = VGroup(T('v / m s⁻¹', 17, self.LIGHT).move_to([-5.2, 1.96, 0]),
                             T('t / s', 17, self.LIGHT).move_to([-.43, -1.67, 0]))
        self.play(Create(ax), FadeIn(ticks), FadeIn(axis_labels), run_time=1)
        track_left, track_right, track_y = -5.75, 5.7, -2.73
        def track_point(x):
            return np.array([track_left+(track_right-track_left)*x/20, track_y, 0])
        track = Line(track_point(0), track_point(20), color=self.AXIS, stroke_width=2)
        track_ticks = VGroup(*[VGroup(Line(track_point(x)+DOWN*.07, track_point(x)+UP*.07, color=self.AXIS),
                                            T(str(x), 14, self.SOFT).move_to(track_point(x)+DOWN*.28)) for x in (0, 5, 10, 15, 20)])
        self.add(track, track_ticks, T('x / m', 16, self.SOFT).next_to(track, RIGHT, buff=.13))
        clock = ValueTracker(0)
        def velocity(): return 2+1.5*clock.get_value()
        def position(): return 2*clock.get_value()+.75*clock.get_value()**2
        curve = always_redraw(lambda: Line(ax.c2p(0, 2), ax.c2p(max(.0001, clock.get_value()), velocity()), color=self.LIGHT, stroke_width=4))
        point = always_redraw(lambda: Dot(ax.c2p(clock.get_value(), velocity()), radius=.065, color=self.LIGHT))
        guide = always_redraw(lambda: DashedLine(ax.c2p(clock.get_value(), 0), ax.c2p(clock.get_value(), velocity()), color=self.AXIS, stroke_width=1.4, dash_length=.06))
        trolley = VGroup(RoundedRectangle(width=.32, height=.18, corner_radius=.04, color=self.LIGHT, fill_opacity=1),
                         Dot([-.10, -.14, 0], radius=.045, color=self.LIGHT), Dot([.10, -.14, 0], radius=.045, color=self.LIGHT))
        trolley.add_updater(lambda m: m.move_to(track_point(position())+UP*.22))
        speed_arrow = always_redraw(lambda: Arrow(track_point(position())+UP*.43, track_point(position())+UP*.43+RIGHT*(.22+.055*velocity()), buff=0, color=self.LIGHT, stroke_width=2.2, max_tip_length_to_length_ratio=.25))
        travelled = always_redraw(lambda: Line(track_point(0), track_point(max(.0001, position())), color=self.LIGHT, stroke_width=5))
        readout = always_redraw(lambda: T(f't = {clock.get_value():.1f} s     v = {velocity():.1f} m/s     x = {position():.1f} m', 19, self.LIGHT).move_to([2.83, -2.13, 0]))
        self.add(guide, curve, point, travelled, trolley, speed_arrow, readout)
        self.formula(self.math('u = 2.0 "m/s"', self.CYAN), self.math('a = 1.5 "m/s"^2', self.AMBER),
                     T('What will v be at t = 4.0 s?', 21, self.LIGHT))
        self.wait(1.5)
        self.play(clock.animate.set_value(4), run_time=8, rate_func=linear)
        # Freeze all dependent objects at the same physical instant before the proof begins.
        for item in (curve, point, guide, trolley, speed_arrow, travelled, readout):
            item.clear_updaters()
        end_label = self.math('(4, 8)', width=1.3).next_to(point, UR, buff=.13)
        self.play(FadeIn(end_label), run_time=.5)
        self.wait(1.5)

        self.stage('The slope explains the velocity', 'A straight line has constant gradient: the same velocity gain in every second.')
        self.play(FadeOut(guide), run_time=.4)
        run = DashedLine(ax.c2p(0, 2), ax.c2p(4, 2), color=self.CYAN, stroke_width=2.2)
        rise = Line(ax.c2p(4, 2), ax.c2p(4, 8), color=self.AMBER, stroke_width=4)
        run_label = self.math('t = 4.0 "s"', self.CYAN, width=2.3).move_to(ax.c2p(2, 2)+DOWN*.3)
        rise_label = self.math('v-u = 6.0 "m/s"', self.AMBER, width=2.55).next_to(rise, RIGHT, buff=.18)
        # Move the rise label into the right workspace briefly, then convert it into symbols.
        rise_label.scale(.75).next_to(rise, RIGHT, buff=.14)
        self.play(Create(run), FadeIn(run_label), run_time=.8)
        self.play(Create(rise), FadeIn(rise_label), run_time=.8)
        self.formula(self.math('a = frac(v-u,t)', self.AMBER),
                     self.math('frac(8.0-2.0,4.0) = 1.5 "m/s"^2'),
                     T('rise ÷ run = acceleration', 19, self.SOFT))
        self.wait(2)
        relation = self.math('v-u = a t', self.AMBER).move_to([3.15, .5, 0])
        self.play(FadeOut(self.panel[1:]), TransformMatchingShapes(self.panel[0], relation), run_time=1.2)
        first_equation = VGroup(self.math('v ='), self.math('u', self.CYAN), self.math('+'), self.math('a t', self.AMBER)).arrange(RIGHT, buff=.16).move_to([3.15, .5, 0])
        self.play(TransformMatchingShapes(relation, first_equation), run_time=1.2)
        numerical = self.math('8.0 = 2.0 + 1.5 times 4.0').move_to([3.15, -.45, 0])
        self.play(FadeIn(numerical), run_time=.6)
        self.panel = VGroup(first_equation, numerical)
        self.wait(2)

        self.stage('Why area measures displacement', 'For a short interval, Δs ≈ v Δt. Add the small displacements across the journey.')
        self.play(FadeOut(VGroup(run, run_label, rise, rise_label, end_label)), run_time=.5)
        slice_width, slice_mid = .24, 1.5
        slice_height = 2+1.5*slice_mid
        strip = Polygon(ax.c2p(slice_mid-slice_width/2, 0), ax.c2p(slice_mid+slice_width/2, 0),
                        ax.c2p(slice_mid+slice_width/2, slice_height), ax.c2p(slice_mid-slice_width/2, slice_height),
                        fill_color=self.LIGHT, fill_opacity=.4, stroke_color=self.LIGHT, stroke_width=1.5)
        dt_label = self.math('Delta t', width=1).scale(.68).move_to(ax.c2p(slice_mid, 0)+DOWN*.41)
        v_label = self.math('v', width=.5).next_to(strip, RIGHT, buff=.12)
        self.play(DrawBorderThenFill(strip), FadeIn(dt_label), FadeIn(v_label), run_time=1)
        self.formula(self.math('Delta s approx v Delta t'), T('height × width', 20, self.SOFT),
                     T('(m/s) × s = m', 20, self.LIGHT))
        # The same small displacement is drawn on the physical position track.
        s0 = 2*(slice_mid-slice_width/2)+.75*(slice_mid-slice_width/2)**2
        s1 = 2*(slice_mid+slice_width/2)+.75*(slice_mid+slice_width/2)**2
        piece = Line(track_point(s0), track_point(s1), color=self.AMBER, stroke_width=9)
        ds_label = self.math('Delta s', self.AMBER, width=1.0).move_to((track_point(s0)+track_point(s1))/2+UP*.43)
        self.play(TransformFromCopy(strip, piece), FadeIn(ds_label), run_time=1.4)
        self.wait(1.5)
        strips = VGroup(*[Polygon(ax.c2p(k/4, 0), ax.c2p((k+1)/4, 0),
                                  ax.c2p((k+1)/4, 2+1.5*(k+.5)/4), ax.c2p(k/4, 2+1.5*(k+.5)/4),
                                  fill_color=self.CYAN, fill_opacity=.22, stroke_color=self.NIGHT, stroke_width=1) for k in range(16)])
        self.play(FadeOut(VGroup(strip, dt_label, v_label, piece, ds_label)), LaggedStart(*[FadeIn(m) for m in strips], lag_ratio=.08), run_time=2)
        area = Polygon(ax.c2p(0, 0), ax.c2p(4, 0), ax.c2p(4, 8), ax.c2p(0, 2), fill_color=self.CYAN, fill_opacity=.23, stroke_width=0).set_z_index(-1)
        self.play(FadeOut(strips), FadeIn(area), run_time=.8)
        self.formula(T('Add every small displacement', 21, self.LIGHT),
                     self.math('s = "area under the" v "–" t "graph"'),
                     self.math('s = 20 "m"'))
        self.wait(2)

        self.stage('Two shapes become one equation', 'Cyan: the initial-velocity contribution. Amber: the extra contribution from acceleration.')
        self.play(FadeOut(area), FadeOut(self.panel), run_time=.5)
        rect = Polygon(ax.c2p(0, 0), ax.c2p(4, 0), ax.c2p(4, 2), ax.c2p(0, 2),
                       fill_color=self.CYAN, fill_opacity=.27, stroke_color=self.CYAN, stroke_width=2).set_z_index(-1)
        tri = Polygon(ax.c2p(0, 2), ax.c2p(4, 2), ax.c2p(4, 8),
                      fill_color=self.AMBER, fill_opacity=.28, stroke_color=self.AMBER, stroke_width=2).set_z_index(-1)
        rect_text = self.math('u t', self.CYAN, width=1).move_to(ax.c2p(2, .95))
        tri_text = self.math('frac(1,2)(v-u)t', self.AMBER, width=2.7).move_to(ax.c2p(2.65, 3.65))
        self.play(DrawBorderThenFill(rect), FadeIn(rect_text), run_time=1)
        initial_term = self.math('u t', self.CYAN)
        extra_term = self.math('frac(1,2)(v-u)t', self.AMBER)
        area_equation = VGroup(self.math('s ='), initial_term, self.math('+'), extra_term).arrange(RIGHT, buff=.14).move_to([3.15, .75, 0])
        self.play(TransformFromCopy(rect_text, initial_term), run_time=1)
        self.play(DrawBorderThenFill(tri), FadeIn(tri_text), run_time=1)
        self.play(TransformFromCopy(tri_text, extra_term), FadeIn(area_equation[0]), FadeIn(area_equation[2]), run_time=1.2)
        substitution = self.math('v-u = a t', self.AMBER).move_to([3.15, -.3, 0])
        self.play(FadeIn(substitution), run_time=.7)
        self.wait(1.4)
        suvat = VGroup(self.math('s ='), self.math('u t', self.CYAN), self.math('+'), self.math('frac(1,2)a t^2', self.AMBER)).arrange(RIGHT, buff=.14).move_to([3.15, .75, 0])
        self.play(TransformMatchingShapes(area_equation, suvat), FadeOut(substitution), run_time=1.5)
        values = VGroup(self.math('8 "m"', self.CYAN), self.math('+'), self.math('12 "m"', self.AMBER), self.math('= 20 "m"')).arrange(RIGHT, buff=.14).move_to([3.15, -.45, 0])
        self.play(FadeIn(values), run_time=.8)
        note = T('Two contributions to the same journey.', 18, self.SOFT).move_to([3.15, -1.2, 0])
        self.play(FadeIn(note), run_time=.5)
        self.panel = VGroup(suvat, values, note)
        self.wait(2.5)

        self.stage('Same graph, different questions', 'Gradient gives acceleration; area gives displacement. SUVAT requires constant acceleration.')
        self.play(FadeOut(self.panel), FadeOut(VGroup(rect_text, tri_text)), rect.animate.set_fill(opacity=.11), tri.animate.set_fill(opacity=.11), run_time=.7)
        gradient_line = Line(ax.c2p(0, 2), ax.c2p(4, 8), color=self.AMBER, stroke_width=5)
        gradient_label = self.math('a = frac(8-2,4) = 1.5 "m/s"^2', self.AMBER).move_to([3.15, .95, 0])
        self.play(Create(gradient_line), FadeIn(gradient_label), run_time=1.2)
        self.wait(1.5)
        area_label = self.math('s = frac(2+8,2) times 4 = 20 "m"', self.CYAN).move_to([3.15, -.15, 0])
        self.play(rect.animate.set_fill(opacity=.27), tri.animate.set_fill(opacity=.28), FadeIn(area_label), run_time=1.2)
        end_notes = VGroup(T('straight line → constant a', 20, self.LIGHT),
                           T('positive v → distance = displacement', 18, self.SOFT)).arrange(DOWN, buff=.23).move_to([3.15, -1.13, 0])
        self.play(FadeIn(end_notes), run_time=.7)
        self.wait(3.5)

class DisplacementSolution(Worked):
    topic='displacement';title='Out and back: distance is not displacement'
    def construct(self):
        self.stage('First leg: travel east','Take east as positive. Ignore the short reversal interval, as stated in the question.')
        ax=self.axes([0,7,1],[-2,4,2]);self.add(T('v / m s⁻¹',18).next_to(ax,UP,buff=.1),T('t / s',18).next_to(ax,RIGHT,buff=.08))
        t=ValueTracker(.001)
        def position():return 3*t.get_value() if t.get_value()<=4 else 12-2*(t.get_value()-4)
        track=Line([-5.8,-2.45,0],[-.7,-2.45,0],color=GRID);robot=always_redraw(lambda:Square(.22,color=B,fill_opacity=1).move_to([-5.8+position()/12*5.1,-2.3,0]));self.add(track,robot)
        area1=always_redraw(lambda:Polygon(ax.c2p(0,0),ax.c2p(min(t.get_value(),4),0),ax.c2p(min(t.get_value(),4),3),ax.c2p(0,3),fill_color=B,fill_opacity=.2,stroke_width=0))
        self.add(area1);self.play(Create(Line(ax.c2p(0,3),ax.c2p(4,3),color=B)),run_time=1)
        self.panel_lines(E('v_1=+3.0 "m/s"',color=B),E('t_1=4.0 "s"'),E('s_1=+12 "m"',color=B))
        self.play(t.animate.set_value(4),run_time=6,rate_func=linear);self.wait(2)
        self.stage('Second leg: travel west','The robot moves back, while the area BELOW the time axis is negative.')
        area2=always_redraw(lambda:Polygon(ax.c2p(4,0),ax.c2p(max(4.001,t.get_value()),0),ax.c2p(max(4.001,t.get_value()),-2),ax.c2p(4,-2),fill_color=R,fill_opacity=.23,stroke_width=0))
        self.add(area2);self.play(Create(Line(ax.c2p(4,-2),ax.c2p(7,-2),color=R)),run_time=1)
        self.panel_lines(E('v_2=-2.0 "m/s"',color=R),E('t_2=3.0 "s"'),E('s_2=-6 "m"',color=R))
        self.play(t.animate.set_value(7),run_time=6,rate_func=linear);self.wait(2)
        self.stage('Count signed area or total path length','For displacement, subtract the return. For distance, count both lengths positively.')
        self.panel_lines(E('Delta x=12-6=+6 "m"',color=B),E('d=abs(12)+abs(-6)=18 "m"',color=R))
        self.add(T('+12 m',20,B).move_to(ax.c2p(2,1.5)),T('−6 m',20,R).move_to(ax.c2p(5.5,-1)),T('START',15,MUTED).move_to([-5.8,-2.85,0]),T('FINISH: +6 m',17,B).move_to([-3.1,-2.85,0]));self.wait(5)
        self.stage('Compare the two averages','The whole journey takes 7.0 s. Average speed is not the mean of 3 and 2.')
        self.panel_lines(E('"average speed"=frac(18,7)=2.57 "m/s"',color=R),E('overline(v)=frac(6,7)=0.857 "m/s"',color=B),T('Opposite directions partly cancel displacement.',20,MUTED).scale_to_fit_width(5.2))
        self.wait(6)
class VectorSolution(Worked):
    topic='vectors';title='Two perpendicular forces: magnitude and direction'
    def construct(self):
        self.stage('Draw the directions first','The forces lie in a horizontal plane. North is a direction on the page, not an upward lift.')
        o=np.array([-3.8,-.25,0]);x=o+RIGHT*1.8;y=o+UP*2.4;end=x+UP*2.4
        self.add(Line([-6.1,-.25,0],[-.5,-.25,0],color=GRID),Line([-3.8,-2.9,0],[-3.8,2.15,0],color=GRID),T('E',18).move_to([-.4,-.25,0]),T('N',18).move_to([-4.15,2.1,0]))
        a=Arrow(o,x,buff=0,color=B);b=Arrow(o,y,buff=0,color=R)
        self.play(GrowArrow(a),run_time=1);self.play(GrowArrow(b),run_time=1)
        self.add(T('6 N',21,B).move_to([-2.9,-.62,0]),T('8 N',21,R).move_to([-4.25,1,0]))
        self.panel_lines(E('R_x=6.0 "N"',color=B),E('R_y=8.0 "N"',color=R),T('Can 6 + 8 be the resultant magnitude?',21).scale_to_fit_width(5.2));self.wait(4)
        self.stage('Add vectors head to tail','Move a COPY of the northward vector to the head of the eastward vector.')
        copy=b.copy();self.add(copy);self.play(copy.animate.shift(RIGHT*1.8),run_time=2)
        resultant=Arrow(o,end,buff=0,color=INK,stroke_width=7);self.play(GrowArrow(resultant),run_time=2)
        self.panel_lines(E('R=sqrt(R_x^2+R_y^2)'),E('R=sqrt(6^2+8^2)=10 "N"',color=B));self.wait(4)
        self.stage('Measure direction from east','Always give a reference direction: this angle is measured north of east.')
        theta=np.arctan2(8,6);arc=Arc(radius=.65,start_angle=0,angle=theta,arc_center=o,color=R);self.play(Create(arc),run_time=1)
        self.add(T('θ',20,R).move_to(o+np.array([.8,.35,0])))
        self.panel_lines(E('tan(theta)=frac(8,6)'),E('theta=53.1 degree',color=R),T('10 N, 53.1° north of east',25,B));self.wait(5)
        self.stage('Find the balancing force','Zero resultant means zero acceleration. A boat may still move with constant nonzero velocity.')
        equilibrant=Arrow(o,o-(end-o),buff=0,color=R,stroke_width=6);self.play(GrowArrow(equilibrant),run_time=2)
        self.panel_lines(E('bold(F)_3=-bold(R)'),E('F_(3x)=-6 "N", quad F_(3y)=-8 "N"'),E('sum bold(F)=bold(0) arrow a=0'),T('10 N, opposite to the resultant',23,R));self.wait(5)
class NewtonSolution(Worked):
    topic='newton';title='Which force belongs in F = ma?'
    def construct(self):
        self.stage('Identify forces on the trolley','Horizontal trolley, m = 4.0 kg. Force diagram shown schematically; the vertical forces balance.')
        o=np.array([-3.4,0,0]);box=Rectangle(width=1.1,height=.7,color=B,fill_color=PALE,fill_opacity=1).move_to(o)
        pull=Arrow(o+RIGHT*.55,o+RIGHT*2.65,buff=0,color=B);resist=Arrow(o+LEFT*.55,o+LEFT*.85,buff=0,color=R)
        vertical=VGroup(Arrow(o+UP*.35,o+UP*1.6,buff=0,color=B),Arrow(o+DOWN*.35,o+DOWN*1.6,buff=0,color=R),T('N',21,B).move_to(o+UP*1.6+LEFT*.4),T('mg',21,R).move_to(o+DOWN*1.6+LEFT*.4))
        forcegroup=VGroup(box,pull,resist,vertical,T('14 N pull',21,B).move_to([-1.8,.55,0]),T('2 N resistance',20,R).move_to([-4.8,-.65,0]),T('4.0 kg',20).move_to(o))
        self.play(FadeIn(forcegroup),run_time=1)
        self.panel_lines(E('F_("net")=F_("pull")-F_("resist")'),E('F_("net")=14-2=12 "N"',color=B),T('Vertical forces balance.',21,MUTED));self.wait(5)
        self.stage('Use the resultant, not the pulling force','Acceleration describes the velocity change each second while these forces remain constant.')
        net=Arrow([-5,-2.2,0],[-1.4,-2.2,0],buff=0,color=B);self.play(GrowArrow(net),run_time=1);net_label=T('Equivalent resultant: 12 N right',21,B).move_to([-3.3,-2.65,0]);self.add(net_label)
        self.panel_lines(E('sum F=m a'),E('a=frac(14-2,4.0)=3.0 "m/s"^2',color=B),T('14 / 4 ignores the opposing force.',20,R));self.wait(5)
        self.stage('Find the gradient of an a–F graph','Hold mass and resistance fixed. The resistance direction assumes the trolley still moves forwards.')
        self.play(FadeOut(forcegroup),FadeOut(net),FadeOut(net_label),run_time=.5)
        before_graph=list(self.mobjects)
        ax=self.axes([0,16,4],[-1,4,1]);self.add(T('a / m s⁻²',18).next_to(ax,UP,buff=.1),T('Fpull / N',18).move_to([-1.2,-2.1,0]))
        graph=ax.plot(lambda F:F/4-.5,x_range=[0,16],color=B);self.play(Create(graph),run_time=3);self.add(Dot(ax.c2p(14,3),color=R))
        graph_items=[m for m in self.mobjects if m not in before_graph]
        self.panel_lines(E('a=frac(1,m)F_("pull")-frac(F_("resist"),m)'),E('a=0.25 F_("pull")-0.50'),E('"gradient"=frac(1,m)=0.25 "kg"^(-1)',color=B));self.wait(4)
        self.stage('Check the third-law claim','Weight and normal force both act on the trolley: they are NOT a third-law pair.')
        self.play(*[FadeOut(m) for m in graph_items],run_time=.5)
        self.play(FadeIn(VGroup(box,vertical,T('Both forces act on the trolley.',20,MUTED).move_to([-3.4,-2.35,0]))),run_time=.5)
        self.panel_lines(T('Weight and normal force:',23),T('same object → not a third-law pair',22,R).scale_to_fit_width(5.2),T('A third-law pair acts on two objects.',21,B).scale_to_fit_width(5.2),T('Equal magnitude; opposite direction.',21).scale_to_fit_width(5.2));self.wait(6)

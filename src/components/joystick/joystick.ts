//import { ros } from "@server/ros/ros-handler";
import {Vector2} from "./vector"

function circle(context : CanvasRenderingContext2D, pos : Vector2, radius : number, color : string) {
    context.beginPath();
    context.fillStyle = color;
    context.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    context.fill();
    context.closePath();
}

class Joystick {
    pos : Vector2;
    origin : Vector2;
    radius : number;
    handleRadius : number;
    handleFriction : number;
    ondrag : boolean;
    touchPos : Vector2;
    tempX : number;
    tempY : number;
    constructor(x: number, y: number, radius:number, handleRadius:number) {
        this.pos = new Vector2(x, y);
        this.origin = new Vector2(x, y);
        this.radius = radius;
        this.handleRadius = handleRadius;
        this.handleFriction = 0.25;
        this.ondrag = false;
        this.touchPos = new Vector2(0, 0);
        this.listener();
        this.tempX = 10;
        this.tempY = 10;
    }
    listener() {
        addEventListener('touchstart', e => {
            this.touchPos = new Vector2(e.touches[0].pageX, e.touches[0].pageY);
            if (this.touchPos.sub(this.origin).mag() <= this.radius) this.ondrag = true;
        });
        addEventListener('touchend', () => {
            this.ondrag = false;
        });
        addEventListener('touchmove', e => {
            this.touchPos = new Vector2(e.touches[0].pageX, e.touches[0].pageY);
        });
	    // Mouse Events
	    addEventListener('mousedown', e => {
            this.touchPos = new Vector2(e.pageX, e.pageY);
            if (this.touchPos.sub(this.origin).mag() <= this.radius) this.ondrag = true;
        });
        addEventListener('mouseup', () => {
            this.ondrag = false;
        });
        addEventListener('mousemove', e => {
            this.touchPos = new Vector2(e.pageX, e.pageY);
        });
    }
    reposition() {
        if (this.ondrag == false) {
            this.pos = this.pos.add(this.origin.sub(this.pos).mul(this.handleFriction));
        } else {
            const diff = this.touchPos.sub(this.origin);
            const maxDist = Math.min(diff.mag(), this.radius);
            this.pos = this.origin.add(diff.normalize().mul(maxDist));
        }
    }
    draw(context : CanvasRenderingContext2D) {
        //Joystick
        circle(context, this.origin, this.radius, '#e57ceb');
        //Handle
        circle(context, this.pos, this.handleRadius, '#3d3d3d');
        
    }
    update(context : CanvasRenderingContext2D) {
        this.reposition();
        this.draw(context);  
        let xVel = 0;
        let yVel = 0;
        
        if (this.ondrag) {
            xVel = 2 * (this.pos.x - this.origin.x) / this.radius;
            yVel = -2 * (this.pos.y - this.origin.y) / this.radius;
        }
        console.log("Joystick Velocities:", xVel, yVel);
    
        // let cmdVel = new ROSLIB.Topic({
        //     linear : {
        //         x : yVel,
        //     },
        //     angular : {
        //         z : xVel
        //     }
        // });

        // cmdVel.publish(twist);
    }
}

export {Joystick}
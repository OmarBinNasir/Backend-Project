#include <stdio.h>

 struct ListNode {
     int val;
    struct ListNode *next;
 };
 
struct ListNode* removeNthFromEnd(struct ListNode* head, int n) {
    int i = 1,count=0;
    struct ListNode* prev,*start;
    start = head;
    while(head != NULL){
       count++;
    }
    head = start;
    while(head != NULL){
         if(i == count - n + 1)
            {
                if(head -> next)  
                 prev -> next = head -> next;
                else
                 prev -> next = NULL ;
                break;
            }
        prev = head;
        head = head -> next;
        i++;
    }
     head = start;
      return head;
    }
int main(){
    struct ListNode 
}
 #include <stdio.h>
 #include <stdlib.h>

 struct ListNode {
      int val;
      struct ListNode *next;
  };
 
struct ListNode* mergeTwoLists(struct ListNode* l1, struct ListNode* l2) {
    struct ListNode *p = NULL,*list3 = NULL, *head = NULL, *prev = NULL;

    p = (struct ListNode*) malloc(sizeof(struct ListNode));
    head = p;
    prev = p;
        
        if(l1 == NULL && l2 == NULL)
        return NULL;
        

        while(l1 != NULL || l2 != NULL){
           if(l1!=NULL && l2!=NULL && l1 -> val < l2 -> val )
            {  
                prev -> next = p;
                prev = p;
                p -> val = l1 -> val;
                l1 = l1 -> next;
                p = (struct ListNode *) malloc(sizeof(struct ListNode));
                p ->  next = NULL;
                
            }
            else if(l1!=NULL && l2!=NULL && l2 -> val < l1 -> val ){
               prev -> next = p;
                prev = p;
                p -> val = l2 -> val;
                l2 = l2 -> next;
                p = (struct ListNode *) malloc(sizeof(struct ListNode));
                p ->  next = NULL;
            }
            else if(l1 == NULL && l2 !=NULL){
                while(l2 != NULL){
                    prev -> next = p;
                    prev = p;
                    p -> val = l1 -> val;
                    l2 = l2 -> next;
                    p = (struct ListNode *) malloc(sizeof(struct ListNode));
                    p ->  next = NULL;
                }
                break;
            }
                else if(l2 == NULL && l1 !=NULL){
                while(l1 != NULL){
                     prev -> next = p;
                     prev = p;
                     p -> val = l1 -> val;
                     l1 = l1 -> next;
                     p = (struct ListNode *) malloc(sizeof(struct ListNode));
                     p ->  next = NULL;
                }
                break;
            }
        }
        return head;
    }    
    
int main(){
    int v,ch;
    while (ch != 1){
        
    }

}